import fs from 'fs-extra'
import path from 'path'
import consola from 'consola'
import { fileURLToPath } from 'url'
import { templateConfig } from '@configs/templateConfig'
import type { TemplateRepoName } from '@configs/getPaths'

const updateMenu = async (templateName: TemplateRepoName, tsSkDir: string) => {
  // ────────────── Update Static Menu ──────────────
  await updateStaticMenu(templateName, tsSkDir)

  // ────────────── Update Menu JSON Data ──────────────
  await updateMenuJsonData(templateName, tsSkDir)

  // ────────────── Update Generate Menu Component ──────────────
  await updateGenerateMenu(tsSkDir)
}

// Update Static Menu
async function updateStaticMenu(templateName: TemplateRepoName, tsSkDir: string) {
  // Vertical Menu File Paths
  const verticalMenuFilePath = path.join(tsSkDir, 'src/components/layout/vertical/VerticalMenu.tsx')

  // Horizontal Menu File Paths
  const horizontalMenuFilePath = path.join(tsSkDir, 'src/components/layout/horizontal/HorizontalMenu.tsx')

  // Replace Vertical Menu File with Starter Kit Version
  updateStaticVerticalMenuContent(templateName, verticalMenuFilePath)

  // Replace Horizontal Menu File with Starter Kit Version
  updateStaticHorizontalMenuContent(templateName, horizontalMenuFilePath)
}

async function updateStaticVerticalMenuContent(templateName: TemplateRepoName, menuFilePath: string) {
  try {
    // Read Menu File
    let content = await fs.readFile(menuFilePath, 'utf8')

    // Remove unnecessary imports and specific lines
    const removalPatterns = [
      /import { useParams } from 'next\/navigation'\n/,
      /import Chip from '@mui\/material\/Chip'\n/,
      /import type { getDictionary } from '@\/utils\/getDictionary'\n/,
      /import { SubMenu, MenuSection } from '@menu\/vertical-menu'\n/,
      /, SubMenu/,
      /, MenuSection/,
      /import CustomChip from '@core\/components\/mui\/Chip'\n/,
      /\/\/ import { GenerateVerticalMenu } from '@components\/GenerateMenu'\n/,
      /\/\/ Menu Data Imports\n\/\/ import menuData from '@\/data\/navigation\/verticalMenuData'\n/,
      /dictionary: Awaited<ReturnType<typeof getDictionary>>\n/,
      /const params = useParams\(\)\n/,
      /const { lang: locale, id } = params\n/
    ]

    removalPatterns.forEach(pattern => {
      content = content.replace(pattern, '')
    })

    // Update VerticalMenu function signature
    content = content.replace(
      /const VerticalMenu = \(\{ dictionary, scrollMenu \}: Props\) => \{/,
      'const VerticalMenu = ({ scrollMenu }: Props) => {'
    )

    const newMenuInnerContent = `
        <MenuItem href='/home' icon={<i className='${templateConfig[templateName]?.menuIcons.home}' />}>
          Home
        </MenuItem>
        <MenuItem href='/about' icon={<i className='${templateConfig[templateName]?.menuIcons.about}' />}>
          About
        </MenuItem>
    `

    // Replace the inner content of the Menu component
    content = content.replace(/(<Menu.*?>(?=\n\s+<\w+))[\s\S]*?(<\/Menu>)/s, `$1${newMenuInnerContent}$2`)

    // Write Menu File
    await fs.writeFile(menuFilePath, content, 'utf8')
    consola.success(`Menu content updated: ${menuFilePath}`)
  } catch (error) {
    consola.error(`Error updating menu content: ${error}`)
  }
}

async function updateStaticHorizontalMenuContent(templateName: TemplateRepoName, menuFilePath: string) {
  try {
    // Read Menu File
    let content = await fs.readFile(menuFilePath, 'utf8')

    // Remove unnecessary imports and specific lines
    const removalPatterns = [
      /import { useParams } from 'next\/navigation'\n/,
      /import Chip from '@mui\/material\/Chip'\n/,
      /import type { getDictionary } from '@\/utils\/getDictionary'\n/,
      /import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu\/horizontal-menu'\n/,
      /import CustomChip from '@core\/components\/mui\/Chip'\n/,
      /\/\/ import { GenerateHorizontalMenu } from '@components\/GenerateMenu'\n/,
      /\/\/ import menuData from '@\/data\/navigation\/horizontalMenuData'\n/,
      /const params = useParams\(\)\n/,
      /const { lang: locale, id } = params\n/
    ]

    // Removing only the SubMenu import from the HorizontalNav import line
    content = content.replace(/, SubMenu/g, '')

    removalPatterns.forEach(pattern => {
      content = content.replace(pattern, '')
    })

    // Update HorizontalMenu function signature
    content = content.replace(
      /const HorizontalMenu = \(\{ dictionary }: \{ dictionary: Awaited<ReturnType<typeof getDictionary>> \}\) => \{/,
      'const HorizontalMenu = () => {'
    )

    const newMenuInnerContent = `
      <MenuItem href='/' icon={<i className='${templateConfig[templateName]?.menuIcons.home}' />}>
        Home
      </MenuItem>
      <MenuItem href='/about' icon={<i className='${templateConfig[templateName]?.menuIcons.about}' />}>
        About
      </MenuItem>
    `

    // Replace the inner content of the Menu component
    content = content.replace(/(<Menu.*?>(?=\n\s+<\w+))[\s\S]*?(<\/Menu>)/s, `$1${newMenuInnerContent}$2`)

    // Write Menu File
    await fs.writeFile(menuFilePath, content, 'utf8')
    consola.success(`Menu content updated: ${menuFilePath}`)
  } catch (error) {
    consola.error(`Error updating menu content: ${error}`)
  }
}

// Update Menu JSON Data
async function updateMenuJsonData(templateName: TemplateRepoName, tsSkDir: string) {
  // Paths for the menu data files
  const verticalMenuJsonDataFilePath = path.join(tsSkDir, 'src/data/navigation/verticalMenuData.tsx')
  const horizontalMenuJsonDataFilePath = path.join(tsSkDir, 'src/data/navigation/horizontalMenuData.tsx')

  // Updated content for Vertical Menu
  let updatedVerticalMenuData = await fs.readFile(
    path.resolve('src/starter-kit/menu-data/verticalMenuData.tsx'),
    'utf8'
  )
  updatedVerticalMenuData = updatedVerticalMenuData.replace('ri-home-smile-line', templateConfig[templateName]?.menuIcons.home)
  updatedVerticalMenuData = updatedVerticalMenuData.replace('ri-information-line', templateConfig[templateName]?.menuIcons.about)

  // Updated content for Horizontal Menu
  let updatedHorizontalMenuData = await fs.readFile(
    path.resolve('src/starter-kit/menu-data/horizontalMenuData.tsx'),
    'utf8'
  )
  updatedHorizontalMenuData = updatedHorizontalMenuData.replace('ri-home-smile-line', templateConfig[templateName]?.menuIcons.home)
  updatedHorizontalMenuData = updatedHorizontalMenuData.replace('ri-information-line', templateConfig[templateName]?.menuIcons.about)

  // Write the updated content to the files
  try {
    await fs.writeFile(verticalMenuJsonDataFilePath, updatedVerticalMenuData, 'utf8')
    await fs.writeFile(horizontalMenuJsonDataFilePath, updatedHorizontalMenuData, 'utf8')
    consola.info('Menu data files updated successfully.')
  } catch (error) {
    consola.error(`Error updating menu data files: ${error}`)
  }
}

async function updateGenerateMenu(tsSkDir: string) {
  try {
    // Menu Utils File Path
    const menuUtilsFilePath = path.join(tsSkDir, 'src/components/GenerateMenu.tsx')

    // Read the content of the file
    let content = await fs.readFile(menuUtilsFilePath, 'utf8')

    // Remove certain imports
    content = content.replace(/import { useParams } from 'next\/navigation'\n/g, '')
    content = content.replace(/import type { Locale } from '@configs\/i18n'\n/g, '')
    content = content.replace(/import { i18n } from '@configs\/i18n'\n/g, '')

    // Remove the localizeUrl function
    const localizeUrlFunctionRegex =
      /const localizeUrl = \(menuItem: VerticalMenuItemDataType, locale: string\) => {[\s\S]*?return href\n}/

    content = content.replace(localizeUrlFunctionRegex, '')

    // Update GenerateVerticalMenu and GenerateHorizontalMenu components to remove locale usage
    content = content.replace(/const \{ lang: locale \} = useParams\(\)\n/g, '')

    // const hrefRegex = /const href = menuItem\.href\?.*?\n/g;
    // const href = menuItem.href ? menuItem.href : menuItem.href && getLocalizedUrl(menuItem.href, locale as Locale)
    const hrefRegex =
      /const href = menuItem\.href\?\.startsWith\('http'\)\s+\?\s+menuItem\.href\s+:\s+menuItem\.href && getLocalizedUrl\(menuItem\.href, locale as Locale\)/g

    content = content.replace(hrefRegex, 'const href = menuItem.href')

    // Write the updated content back to the file
    await fs.writeFile(menuUtilsFilePath, content)
    consola.info('GenerateMenu.tsx file updated successfully.')
  } catch (error) {
    consola.error(`Error updating GenerateMenu.tsx file: ${error}`)
  }
}

export default updateMenu
