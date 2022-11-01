// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: 'bx:home-circle',
      path: '/dashboard'     
    },
    {
      icon: 'bx:cog',
      title: 'Account Settings',
      path: '/pages/account-settings'
    },
    {
      sectionTitle: 'Pages'
    },
    {
      title: 'Login',
      icon: 'mdi:login',
      openInNewTab: true,
      path: '/login'
    },
    {
      title: 'Register',
      openInNewTab: true,
      path: '/register',
      icon: 'mdi:account-plus-outline',
    },
    {
      title: 'Error',
      openInNewTab: true,
      path: '/404',
      icon: 'mdi:alert-circle-outline',
    },
    {
      sectionTitle: 'User Interface'
    },
    {
      title: 'Typography',
      icon: 'bx:text',
      path: '/ui/typography'
    },
    {
      title: 'Icons',
      path: '/ui/icons',
      icon: 'bx:crown'
    },
    {
      title: 'Cards',
      icon: 'bx:collection',
      path: '/ui/cards',
    },  
    {
      title: 'Tables',
      icon: 'bx:table',
      path: '/tables/mui'
    },
    {
      icon: 'bx:detail',
      title: 'Form Layouts',
      path: '/forms/form-layouts'
    },
  ]
}

export default navigation
