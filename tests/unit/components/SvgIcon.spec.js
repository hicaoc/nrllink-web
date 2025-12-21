import { shallowMount } from '@vue/test-utils'
import SvgIcon from '@/components/SvgIcon/index.vue'
describe('SvgIcon.vue', () => {
  it('iconClass', () => {
    const wrapper = shallowMount(SvgIcon, {
      props: {
        iconClass: 'test'
      }
    })
    const attrs = wrapper.find('use').attributes()
    expect(attrs['xlink:href'] || attrs.href).toBe('#icon-test')
  })
  it('className', async () => {
    const wrapper = shallowMount(SvgIcon, {
      props: {
        iconClass: 'test'
      }
    })
    expect(wrapper.classes()).toContain('svg-icon')
    await wrapper.setProps({ className: 'test' })
    expect(wrapper.classes()).toContain('test')
  })
})
