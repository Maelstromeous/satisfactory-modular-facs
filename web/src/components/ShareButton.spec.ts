import { describe, expect, it } from 'vitest'
import ShareButton from './ShareButton.vue'
import {vuetifyRender} from "@/utils/ui-test-bootstrap";

describe('ShareButton', () => {
  it('should match snapshot', () => {
    const subject = vuetifyRender(ShareButton)
    expect(subject.html()).toMatchSnapshot()
  })
})
