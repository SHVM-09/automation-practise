import path from 'path'
import fs from 'fs-extra'
import consola from 'consola'

export const removeTestPages = async (templateDir: string): Promise<void> => {
  consola.start(`Removing test pages from ${templateDir}...`)

  const isTs = templateDir.includes('typescript')

  // Remove test files
  const filesToRemove = ['src/views/icons-test', 'src/app/api/icons-test', 'src/app/[lang]/(dashboard)/icons-test'].map(
    subPath => path.join(templateDir, subPath)
  )

  await Promise.all(
    filesToRemove.map(async filePath => {
      await fs.rm(filePath, { recursive: true, force: true })
    })
  )

  // Remove test pages from the navigation menu files
  const menuFilePaths = [
    `src/components/layout/horizontal/HorizontalMenu.${isTs ? 'tsx' : 'jsx'}`,
    `src/components/layout/vertical/VerticalMenu.${isTs ? 'tsx' : 'jsx'}`
  ].map(subPath => path.join(templateDir, subPath))

  await Promise.all(
    menuFilePaths.map(async filePath => {
      let menuContent = await fs.readFile(filePath, 'utf-8')

      menuContent = menuContent.replace(/<MenuItem.*[\n\s]+Icons Test[\n\s]+<\/MenuItem>[\n\s]+/gm, '')

      await fs.writeFile(filePath, menuContent, 'utf-8')
    })
  )

  // Remove test pages from the navigation menu data files
  const navLinksFiles = [
    `src/data/navigation/horizontalMenuData.${isTs ? 'tsx' : 'jsx'}`,
    `src/data/navigation/verticalMenuData.${isTs ? 'tsx' : 'jsx'}`
  ].map(subPath => path.join(templateDir, subPath))

  await Promise.all(
    navLinksFiles.map(async filePath => {
      let navContent = await fs.readFile(filePath, 'utf-8')

      navContent = navContent.replace(/,?\s*{\s*[^{}]*?label: 'Icons Test'[^{}]*?}\s*/g, '')

      await fs.writeFile(filePath, navContent, 'utf-8')
    })
  )

  // Remove test pages from the search data file
  const searchDataFilePath = path.join(templateDir, `src/data/searchData.${isTs ? 'ts' : 'js'}`)
  let content = await fs.readFile(searchDataFilePath, 'utf-8')

  content = content.replace(/,?\s*{\s*[^{}]*?name: 'Icons Test'[^{}]*?}\s*/g, '')

  await fs.writeFile(searchDataFilePath, content, 'utf-8')

  consola.success(`Removed test pages successfully from ${templateDir}!\n`)
}
