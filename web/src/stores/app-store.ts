// Utilities
import { defineStore } from 'pinia'
import { Factory, FactoryPower, FactoryTab } from '@/interfaces/planner/FactoryInterface'
import { ref, watch } from 'vue'
import { calculateFactories } from '@/utils/factory-management/factory'
import { useGameDataStore } from '@/stores/game-data-store'
import { validateFactories } from '@/utils/factory-management/validation'

export const useAppStore = defineStore('app', () => {
  const inited = ref(false)
  const factoryTabs = ref<FactoryTab[]>(JSON.parse(localStorage.getItem('factoryTabs') ?? '[]') as FactoryTab[])

  if (factoryTabs.value.length === 0) {
    factoryTabs.value = [
      {
        id: crypto.randomUUID(),
        name: 'Default',
        // Fill the tabs from the legacy factories array if present so no data gets lost
        factories: JSON.parse(localStorage.getItem('factories') ?? '[]'),
      },
    ]
  }

  const currentFactoryTabIndex = ref(0)
  const currentFactoryTab = computed(() => factoryTabs.value[currentFactoryTabIndex.value])

  const factories = computed({
    get () {
      return currentFactoryTab.value.factories
    },
    set (value) {
      currentFactoryTab.value.factories = value
    },
  })

  const lastSave = ref<Date>(new Date(localStorage.getItem('lastSave') ?? ''))
  const lastEdit = ref<Date>(new Date(localStorage.getItem('lastEdit') ?? ''))
  const isDebugMode = ref<boolean>(false)
  const showSatisfactionBreakdowns = ref<boolean>(
    (localStorage.getItem('showSatisfactionBreakdowns') ?? 'false') === 'true'
  )
  const gameDataStore = useGameDataStore()

  // Watch the factories array for changes
  watch(factoryTabs.value, () => {
    localStorage.setItem('factoryTabs', JSON.stringify(factoryTabs.value))
    setLastEdit() // Update last edit time whenever the data changes, from any source.
  }, { deep: true })

  const getLastEdit = (): Date => {
    return lastEdit.value
  }

  const setLastEdit = () => {
    lastEdit.value = new Date()
    localStorage.setItem('lastEdit', lastEdit.value.toISOString())
  }
  const setLastSave = () => {
    lastSave.value = new Date()
    localStorage.setItem('lastSave', lastSave.value.toISOString())
  }

  // ==== FACTORY MANAGEMENT
  // This function is needed to ensure that data fixes are applied as we migrate things and change things around.
  const initFactories = (newFactories: Factory[]) => {
    console.log('Initializing factories', newFactories)
    let needsCalculation = false

    validateFactories(newFactories) // Ensure the data is clean

    newFactories.forEach(factory => {
      // Patch for #222
      if (factory.inSync === undefined) {
        factory.inSync = null
      }
      if (factory.syncState === undefined) {
        factory.syncState = {}
      }

      // Patch for #244 and #180
      // Detect if the factory.parts[part].amountRequiredExports is missing and calculate it.
      Object.keys(factory.parts).forEach(part => {
        // For #244
        if (factory.parts[part].amountRequiredExports === undefined) {
          factory.parts[part].amountRequiredExports = 0
          needsCalculation = true
        }
        if (factory.parts[part].amountRequiredProduction === undefined) {
          factory.parts[part].amountRequiredProduction = 0
          needsCalculation = true
        }

        // For #180
        if (factory.parts[part].amountRequiredPower === undefined) {
          factory.parts[part].amountRequiredPower = 0
          needsCalculation = true
        }
        if (factory.parts[part].amountSuppliedViaRaw === undefined) {
          factory.parts[part].amountSuppliedViaRaw = 0
          needsCalculation = true
        }
        if (factory.parts[part].exportable === undefined) {
          factory.parts[part].exportable = true
          needsCalculation = true
        }
      })

      // Patch for #250
      if (factory.tasks === undefined) {
        factory.tasks = []
      }
      if (factory.notes === undefined) {
        factory.notes = ''
      }

      // Patch for #180
      if (factory.powerProducers === undefined) {
        factory.powerProducers = []
        needsCalculation = true
      }
      if (factory.power === undefined) {
        factory.power = {} as FactoryPower
        needsCalculation = true
      }
      if (factory.previousInputs === undefined) {
        factory.previousInputs = []
      }

      // Add data version so we understand how old the data is (#317)
      if (factory.dataVersion === undefined) {
        factory.dataVersion = '2025-01-03'
      }
    })

    if (needsCalculation) {
      console.log('Forcing calculation of factories due to data migration')
      calculateFactories(newFactories, gameDataStore.getGameData())
    }

    inited.value = true
    factories.value = newFactories
    return factories.value
  }

  const setFactories = (newFactories: Factory[], loadMode = false) => {
    console.log('Setting factories', newFactories, 'loadMode:', loadMode)

    const gameData = gameDataStore.getGameData()
    if (!gameData) {
      console.error('Unable to load game data!')
      return
    }

    // Init factories ensuring the data is valid
    initFactories(newFactories)

    // Trigger calculations
    calculateFactories(newFactories, gameData, loadMode)

    // For each factory, set the previous inputs to the current inputs.
    newFactories.forEach(factory => {
      factory.previousInputs = factory.inputs
    })

    factories.value = newFactories
    // Will also call the watcher.
  }

  const addFactory = (factory: Factory) => {
    factories.value.push(factory)
  }

  const removeFactory = (id: number) => {
    const index = factories.value.findIndex(factory => factory.id === id)
    if (index !== -1) {
      factories.value.splice(index, 1)
    }
  }

  const clearFactories = () => {
    factories.value.length = 0
    factories.value = []
  }
  // ==== END FACTORY MANAGEMENT

  // ==== TAB MANAGEMENT
  const addTab = ({
    id = crypto.randomUUID(),
    name = 'New Tab',
    factories = [],
  } = {} as Partial<FactoryTab>) => {
    factoryTabs.value.push({
      id,
      name,
      factories,
    })

    currentFactoryTabIndex.value = factoryTabs.value.length - 1
  }

  const removeCurrentTab = async () => {
    if (factoryTabs.value.length === 1) return

    if (factories.value.length && !window.confirm('Are you sure you want to delete this tab? This will delete all factories in it.')) {
      return
    }

    factoryTabs.value.splice(currentFactoryTabIndex.value, 1)
    currentFactoryTabIndex.value = Math.min(currentFactoryTabIndex.value, factoryTabs.value.length - 1)
  }
  // ==== END TAB MANAGEMENT

  const getSatisfactionBreakdowns = () => {
    return showSatisfactionBreakdowns
  }
  const changeSatisfactoryBreakdowns = () => {
    showSatisfactionBreakdowns.value = !showSatisfactionBreakdowns.value
    localStorage.setItem('showSatisfactionBreakdowns', showSatisfactionBreakdowns.value ? 'true' : 'false')
  }

  // ==== MISC
  const debugMode = () => {
    if (window.location.hostname !== 'satisfactory-factories.app') {
      return true
    }

    return window.location.search.includes('debug')
  }

  isDebugMode.value = debugMode()
  // ==== END MISC

  // Upon load, force the initFactories() to be ran to ensure migrations are applied
  initFactories(factories.value)

  return {
    currentFactoryTab,
    currentFactoryTabIndex,
    factoryTabs,
    factories,
    lastSave,
    lastEdit,
    isDebugMode,
    getLastEdit,
    setLastSave,
    setLastEdit,
    getFactories: () => inited.value ? factories.value : initFactories(factories.value),
    setFactories,
    initFactories,
    addFactory,
    removeFactory,
    clearFactories,
    addTab,
    removeCurrentTab,
    getSatisfactionBreakdowns,
    changeSatisfactoryBreakdowns,
  }
})
