import type { HorizontalNavItems } from '@layouts/types'

export default [
  {
    title: 'Home',
    to: { name: 'index' },
    icon: { icon: 'bx-home-alt' },
  },
  {
    title: 'Second page',
    to: { name: 'second-page' },
    icon: { icon: 'bx-file-blank' },
  },
] as HorizontalNavItems
