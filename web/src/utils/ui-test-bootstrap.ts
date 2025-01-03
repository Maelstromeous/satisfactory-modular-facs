// test-utils.js
import { render } from '@testing-library/vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {createTestingPinia} from "@pinia/testing";

// 1. Create the Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark'
  }
})

/**
 * Custom render that includes the Vuetify plugin
 */
export function vuetifyRender(component: any, options = {}) {
  return render(component, {
    global: {
      plugins: [vuetify, createTestingPinia()],
    },
    ...options,
  })
}
