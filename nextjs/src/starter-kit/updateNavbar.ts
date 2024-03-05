import fs from 'fs'
import path from 'path'
import consola from 'consola'

// Update Navbar Content
const updateNavbar = async (tsSkDir: string) => {
  // ────────────── Update Vertical Menu Layout Navbar ──────────────
  consola.info('Updating Vertical Menu Layout Navbar')

  const verticalNavbarContentFilePath = path.join(tsSkDir, 'src/components/layout/vertical/NavbarContent.tsx')

  await updateNavbarContent(verticalNavbarContentFilePath)

  consola.success('Updated Vertical Menu Layout Navbar')

  // ────────────── Update Horizontal Menu Layout Navbar ──────────────
  consola.info('Updating Horizontal Menu Layout Navbar')

  const horizontalNavbarContentFilePath = path.join(tsSkDir, 'src/components/layout/horizontal/NavbarContent.tsx')

  await updateNavbarContent(horizontalNavbarContentFilePath)

  consola.success('Updated Horizontal Menu Layout Navbar')
}

async function updateNavbarContent(navbarContentFilePath: string) {
  try {
    const isVerticalLayout = navbarContentFilePath.includes('vertical')
    let updatedContent = ''

    if (isVerticalLayout) {
      // Content for Vertical Layout
      updatedContent = `'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <ModeDropdown />
      </div>
      <div className='flex items-center'>
        <UserDropdown />
      </div>
    </div>
  );
};

export default NavbarContent;
      `
    } else {
      // Content for Horizontal Layout
      updatedContent = `'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle';
import Logo from '@components/layout/shared/Logo';
import ModeDropdown from '@components/layout/shared/ModeDropdown';
import UserDropdown from '@components/layout/shared/UserDropdown';

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()
  return (
    <div className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && <Logo />}
      </div>
      <div className='flex items-center'>
        <ModeDropdown />
        <UserDropdown />
      </div>
    </div>
  );
};

export default NavbarContent;
      `
    }

    fs.writeFileSync(navbarContentFilePath, updatedContent)
  } catch (error) {
    consola.error(`Error updating navbar content: ${error}`)
  }
}

export default updateNavbar
