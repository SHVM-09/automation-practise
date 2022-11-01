
// ** Type Import
import { LayoutProps } from 'src/@core/layouts/types'

// ** Layout Components
import VerticalLayout from './VerticalLayout'

const Layout = (props: LayoutProps) => {
  // ** Props
  const {  children, } = props

  return <VerticalLayout {...props}>{children}</VerticalLayout>
}

export default Layout
