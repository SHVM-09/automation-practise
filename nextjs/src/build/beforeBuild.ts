import fs from 'fs/promises'
import { globbySync } from 'globby'
import path from 'path'
import { getUrls } from '@configs/getUrls'

/**
 * Update Calendar Event functions.
 */
const updateCalendarEventFunctions = async (tsFullDir: string): Promise<void> => {
  const filePath = path.join(tsFullDir, 'src/views/apps/calendar/CalendarWrapper.tsx')

  const handleAddEventFunction = `const handleAddEvent = async (event: AddEventType) => {
    const event_id = new Date().getTime().toString()

    // Dispatch Add Event Action
    dispatch({ type: 'added', event: { id: parseInt(event_id), ...event } })
  }

`

  const handleUpdateEventFunction = `const handleUpdateEvent = async (event: EventType) => {
    dispatch({ type: 'updated', event })
  }

`

  const handleDeleteEventFunction = `const handleDeleteEvent = async (eventId: EventType['id']) => {
    dispatch({ type: 'deleted', eventId })
  }

`

  let content = await fs.readFile(filePath, 'utf-8')

  content = content
    .replace(/const handleAddEvent = async \([^)]*\)\s*=>\s*{[\s\S]*?}\n\n/gm, handleAddEventFunction)
    .replace(/const handleUpdateEvent = async \([^)]*\)\s*=>\s*{[\s\S]*?}\n\n/gm, handleUpdateEventFunction)
    .replace(/const handleDeleteEvent = async \([^)]*\)\s*=>\s*{[\s\S]*?}\n\n/gm, handleDeleteEventFunction)

  await fs.writeFile(filePath, content)
}

/**
 * Append base path to image references in TypeScript API files.
 */
async function prependBasePathToImages(tsFullDir: string, basePath: string): Promise<void> {
  if (!basePath) {
    console.log('No basePath found in `process.env.BASEPATH`, skipping...')

    return
  }

  const apiFiles = globbySync(['src/app/api/**/*.ts'], {
    cwd: tsFullDir,
    absolute: true,
    gitignore: false,
    dot: true
  })

  await Promise.all(
    apiFiles.map(async (file: string): Promise<void> => {
      let content = await fs.readFile(file, 'utf-8')

      content = content.replace(/\/images\//g, `${basePath}/images/`)
      await fs.writeFile(file, content)
    })
  )
}

/**
 * Remove Google Sign-In from Login component.
 */
const removeGoogleSignInFromLogin = async (tsFullDir: string): Promise<void> => {
  const loginFilePath = path.join(tsFullDir, 'src/views/Login.tsx')
  let content = await fs.readFile(loginFilePath, 'utf-8')

  content = content.replace(/<Divider.*?<\/Button>/gms, '').replace(/import Divider.*/g, '')
  await fs.writeFile(loginFilePath, content, 'utf-8')
}

/**
 * Remove Icon Test feature from project files.
 */
const removeIconTestFeature = async (tsFullDir: string): Promise<void> => {
  const searchDataFilePath = path.join(tsFullDir, 'src/data/searchData.ts')
  let content = await fs.readFile(searchDataFilePath, 'utf-8')

  content = content.replace(/(?<=id: '41'.*){.*icons-test.*?},.*?(?={)/gms, '')
  await fs.writeFile(searchDataFilePath, content, 'utf-8')

  const filesToRemove = ['src/views/icons-test', 'src/app/api/icons-test', 'src/app/[lang]/(dashboard)/icons-test'].map(
    subPath => path.join(tsFullDir, subPath)
  )

  await Promise.all(
    filesToRemove.map(async filePath => {
      await fs.rm(filePath, { recursive: true, force: true })
    })
  )

  const menuFilePaths = [
    'src/components/layout/horizontal/HorizontalMenu.tsx',
    'src/components/layout/vertical/VerticalMenu.tsx'
  ].map(subPath => path.join(tsFullDir, subPath))

  await Promise.all(
    menuFilePaths.map(async filePath => {
      let menuContent = await fs.readFile(filePath, 'utf-8')

      menuContent = menuContent.replace(/<MenuItem.*[\n\s]+Icons Test[\n\s]+<\/MenuItem>[\n\s]+/gm, '')
      await fs.writeFile(filePath, menuContent, 'utf-8')
    })
  )

  const navLinksFiles = ['src/data/navigation/horizontalMenuData.tsx', 'src/data/navigation/verticalMenuData.tsx'].map(
    subPath => path.join(tsFullDir, subPath)
  )

  await Promise.all(
    navLinksFiles.map(async filePath => {
      let navContent = await fs.readFile(filePath, 'utf-8')

      navContent = navContent.replace(/[\n\s]+{[\s\n]+label: 'Icons Test',.*?}/gms, '')
      await fs.writeFile(filePath, navContent, 'utf-8')
    })
  )
}

/**
 * Update Next.js configuration with custom headers.
 */
const updateNextJsConfigWithHeaders = async (templateName: string, tsFullDir: string): Promise<void> => {
  const nextConfigFilePath = path.join(tsFullDir, 'next.config.js')
  let configContent = await fs.readFile(nextConfigFilePath, 'utf-8')
  const siteName = (templateName === 'vuexy' || templateName === 'materialize') ? 'pixinvent' : 'themeselection'

  const headersConfig = `
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "https://demos.${siteName}.com" },
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          ]
        }
      ]
    },
  `

  configContent = configContent.replace(/( +)(reactStrictMode: false)/gms, `$1$2,\n$1${headersConfig}`)
  await fs.writeFile(nextConfigFilePath, configContent, 'utf-8')
}

async function updateUrlsForMarketplace(tsFullDir: string): Promise<void> {
  const files = globbySync(
    [
      'src/components/layout/vertical/FooterContent.tsx',
      'src/components/layout/horizontal/FooterContent.tsx',
      'src/components/layout/vertical/VerticalMenu.tsx',
      'src/components/layout/horizontal/HorizontalMenu.tsx',
      'src/data/navigation/horizontalMenuData.tsx',
      'src/data/navigation/verticalMenuData.tsx',
      'src/components/buy-now-button/index.tsx'
    ],
    {
      cwd: tsFullDir,
      absolute: true,
      gitignore: false,
      dot: true
    }
  )

  await Promise.all(
    files.map(async (file: string): Promise<void> => {
      let content = await fs.readFile(file, 'utf-8')

      // Loop through all URLs
      const urls = getUrls('materio')

      for (const url of Object.keys(urls)) {
        const urlWithoutTrailingSlash = url.replace(/\/$/, '')
        const regex = new RegExp(`('|")${urlWithoutTrailingSlash}\\/?('|")`, 'g')

        content = content.replace(regex, `$1${urls[url]}$2`)
      }

      await fs.writeFile(file, content)
    })
  )
}

// TODO: Feel free to improve this because this is written in hurry
const updateModeStorageKey = async (tsFullDir: string) => {
  const themeProviderPath = path.join(tsFullDir, 'src/components/theme/index.tsx')
  let content = await fs.readFile(themeProviderPath, 'utf-8')

  content = content

    // Add type
    .replace(" } from '@core/types'", ", DemoName } from '@core/types'")

    // Add prop
    .replace('systemMode: SystemMode', 'systemMode: SystemMode\n  demoName: DemoName')

    // Add replace
    .replace('mui-template-mode`', 'mui-template-mode-${props.demoName}`')

  // Write back to file
  await fs.writeFile(themeProviderPath, content)

  const providersPath = path.join(tsFullDir, 'src/components/Providers.tsx')
  let providerContent = await fs.readFile(providersPath, 'utf-8')

  providerContent = providerContent.replace(
    '<ThemeProvider direction={direction} systemMode={systemMode}>',
    '<ThemeProvider direction={direction} systemMode={systemMode} demoName={demoName}>'
  )

  await fs.writeFile(providersPath, providerContent)
}

async function beforeBuild(templateName: string, tsFullDir: string, basePath: string, isMarketplaceBuild: boolean): Promise<void> {
  // Update URLs
  if (isMarketplaceBuild) {
    await updateUrlsForMarketplace(tsFullDir)
  }

  // Update Calendar Event functions
  await updateCalendarEventFunctions(tsFullDir)

  // Append base path to image references in TypeScript API files
  await prependBasePathToImages(tsFullDir, basePath)

  // Remove Google Sign-In from Login component
  await removeGoogleSignInFromLogin(tsFullDir)

  // Remove Icon Test feature from project files
  await removeIconTestFeature(tsFullDir)

  // Update Next.js configuration with custom headers
  await updateNextJsConfigWithHeaders(templateName, tsFullDir)

  await updateModeStorageKey(tsFullDir)
}

export default beforeBuild
