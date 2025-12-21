import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import Hamburger from '@/components/Hamburger/index.vue'
describe('Hamburger.vue', () => {
  it('toggle click', async () => {
    const wrapper = shallowMount(Hamburger)
    await wrapper.find('.hamburger').trigger('click')
    expect(wrapper.emitted().toggleClick).toBeTruthy()
  })
  it('prop isActive', async () => {
    const wrapper = shallowMount(Hamburger)
    await wrapper.setProps({ isActive: true })
    expect(wrapper.find('svg').classes()).toContain('is-active')
    await wrapper.setProps({ isActive: false })
    expect(wrapper.find('svg').classes()).not.toContain('is-active')
  })
})
