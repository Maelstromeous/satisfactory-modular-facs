import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import Loading from '@/components/Loading.vue'
import eventBus from '@/utils/eventBus'
import { vuetifyRender } from '@/utils/ui-test-bootstrap'

describe('Loading.vue', () => {
  it('forces afterEnter by firing a transitionEnd event on the correct element', async () => {
    const spy = vi.spyOn(eventBus, 'emit')

    // 1) Render the overlay, which starts open
    vuetifyRender(Loading)

    // 2) Wait for Vue to finish mounting & any microtasks
    await flushPromises()

    // 3) The <v-overlay> itself might not be the real element that receives the DOM transition
    //    Sometimes Vuetify uses a child with class .v-overlay__content or .v-overlay-container.
    //    We'll try data-testid first:
    const overlayEl = screen.getByTestId('loading-overlay')
    expect(overlayEl).toBeTruthy()

    // 4) If you see in your rendered DOM that a child receives the transition, do this:
    //      const overlayContent = overlayEl.querySelector('.v-overlay__content') || overlayEl
    //    Otherwise, just keep overlayEl. We'll try child first:
    const overlayContent = overlayEl.querySelector('.v-overlay__content') || overlayEl

    // 5) Fire the transitionEnd event manually with propertyName = 'opacity'
    //    This is often what Vuetify checks to know the fade-in is done.
    await fireEvent.transitionEnd(overlayContent, {
      propertyName: 'opacity',
    })

    // 6) Now, afterEnter should have fired, which does console.log + eventBus.emit
    expect(spy).toHaveBeenCalledWith('readyForFirstLoad')

    spy.mockRestore()
  })
})
