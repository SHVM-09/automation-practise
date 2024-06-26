import fs from 'fs'
import path from 'path'
import { globbySync } from 'globby'
import consola from 'consola'

// Remove Translation from the starter-kit
async function removeTranslation(tsSkDir: string) {
  // Vars
  const appDir = path.join(tsSkDir, 'src/app')
  const providerFile = path.join(tsSkDir, 'src/components/Providers.tsx')
  const logoFile = path.join(tsSkDir, 'src/components/layout/shared/Logo.tsx')
  const componentsDir = path.join(tsSkDir, 'src/components')
  const nextConfigFile = path.join(tsSkDir, 'next.config.js')

  // Remove translation code from app directory files
  await removeTranslationFromAppDir(appDir)

  // Remove translation code from Provider
  await removeTranslationFromProvider(providerFile)

  // Remove translation code from Logo
  await removeTranslationFromLogo(logoFile)

  // Remove translation code from components directory files
  await removeTranslationFromComponentsDir(componentsDir)

  // Remove redirects from next.config.js
  await removeTranslationFromNextConfig(nextConfigFile)
}

/**
 * Recursively finds and processes layout.tsx and page.tsx files in a directory.
 * @param baseDir - The base directory to search in.
 */
async function removeTranslationFromAppDir(baseDir: string): Promise<void> {
  const filePattern = path.join(baseDir, '**/*(layout|page).tsx').replace(/\\/g, '/')
  const files = globbySync(filePattern)

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8')

      // Modify these regex patterns based on the specific translation code you want to remove
      content = content.replace(/import { i18n } from '@configs\/i18n'\n/g, '')
      content = content.replace(/import type { Locale } from '@configs\/i18n'\n/g, '')
      content = content.replace(/import { getDictionary } from '@\/utils\/getDictionary'\n/g, '')
      content = content.replace(/const direction = i18n.langDirection\[params.lang\]/g, "const direction = 'ltr'")
      content = content.replace(/const dictionary = await getDictionary\(params.lang\)\n/g, '')
      content = content.replace(/lang={params\.lang}/g, 'lang="en"')

      // Remove 'dictionary' prop from any component
      content = content.replace(/<[^>]+\sdictionary={[^}]+}[^>]*>/g, match => {
        return match.replace(/\sdictionary={[^}]+}/, '')
      })

      // Update function parameters: { children, params }: ChildrenType & { params: { lang: Locale } } to { children }: ChildrenType
      content = content.replace(
        /\{\s*children,\s*params\s*\}\s*:\s*ChildrenType\s*&\s*\{\s*params:\s*\{\s*lang:\s*Locale\s*\}\s*\}/g,
        '{ children }: ChildrenType'
      )

      // Update function parameters: { children, params }: Props
      content = content.replace(/\{\s*children,\s*params\s*\}\s*:\s*Props/g, '{ children }: Props')

      // Update type definition: type Props = ChildrenType & { params: { lang: Locale } } to type Props = ChildrenType
      content = content.replace(
        /type Props = ChildrenType & \{\s*params:\s*\{\s*lang:\s*Locale\s*\}\s*\}/g,
        'type Props = ChildrenType'
      )

      // Remove { params }: { params: { lang: Locale } }
      content = content.replace(/\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*lang:\s*Locale\s*\}\s*\}/g, '')

      fs.writeFileSync(file, content)
      consola.info(`Updated file: ${file}`)
    } catch (err) {
      consola.error(`Error processing file ${file}: ${err}`)
    }
  })

  consola.success(`Translation code removed from files in: ${baseDir}`)
}

async function removeTranslationFromProvider(providerFile: string) {
  try {
    let content = fs.readFileSync(providerFile, 'utf8')

    // Modify these regex patterns based on the specific translation code you want to remove
    content = content.replace(/import { NextAuthProvider } from '@\/contexts\/nextAuthProvider'\n/g, '')
    content = content.replace(/import AppReactToastify from '@\/libs\/styles\/AppReactToastify'\n/g, '')
    content = content.replace(/import themeConfig from '@configs\/themeConfig'\n/g, '')
    content = content.replace(/<AppReactToastify[^>]*\/>\s*\n/g, '')

    // Remove NextAuthProvider start and end tag, keep its children
    content = content.replace(/<NextAuthProvider[^>]*>\s*/g, '') // Remove the opening tag
    content = content.replace(/\s*<\/NextAuthProvider>/g, '') // Remove the closing tag

    // Existing removals
    fs.writeFileSync(providerFile, content)
    consola.info(`Updated file: ${providerFile}`)
  } catch (err) {
    consola.error(`Error processing file ${providerFile}: ${err}`)
  }
}

async function removeTranslationFromLogo(logoFile: string) {
  try {
    let content = fs.readFileSync(logoFile, 'utf8')

    // Modify these regex patterns based on the specific translation code you want to remove
    content = content.replace(/import { useParams } from 'next\/navigation'\n/g, '')
    content = content.replace(/const { lang: locale } = useParams\(\)/g, '')
    content = content.replace(/import type { Locale } from '@configs\/i18n'\n/g, '')
    content = content.replace(/<Link href=\{getLocalizedUrl\('\/', locale as Locale\)\}([^>]*)>/g, "<Link href='/'$1>")

    fs.writeFileSync(logoFile, content)
    consola.info(`Updated file: ${logoFile}`)
  } catch (err) {
    consola.error(`Error processing file ${logoFile}: ${err}`)
  }
}

async function removeTranslationFromComponentsDir(baseDir: string): Promise<void> {
  const filePattern = path.join(baseDir, '**/*.tsx').replace(/\\/g, '/')
  const files = globbySync(filePattern)

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8')

      // Remove import of getLocalizedUrl from i18n utils
      content = content.replace(/import { getLocalizedUrl } from '@\/utils\/i18n'\n/g, '')

      // Remove import of getDictionary
      content = content.replace(/import type { getDictionary } from '@\/utils\/getDictionary'\n/g, '')

      // Remove dictionary prop from components
      content = content.replace(/<[^>]+\sdictionary=\{dictionary\}[^>]*>/g, match => {
        return match.replace(/\sdictionary=\{dictionary\}/, '')
      })

      // Remove dictionary type definition
      content = content.replace(/dictionary:\s*Awaited<ReturnType<typeof getDictionary>>,*\s*/gs, '')

      // Remove dictionary from object destructuring
      content = content.replace(/const \{([^}]*)dictionary,?([^}]*)\} = props/g, 'const {$1$2} = props')

      // Remove dictionary parameter pattern
      content = content.replace(/{ dictionary }: { dictionary: Awaited\<ReturnType\<typeof getDictionary\>\> }/g, '')
      content = content.replace(/{ dictionary }: { }/g, '')

      fs.writeFileSync(file, content)
    } catch (err) {
      consola.error(`Error processing file ${file}: ${err}`)
    }
  })
}

async function removeTranslationFromNextConfig(nextConfigFile: string) {
  try {
    let content = fs.readFileSync(nextConfigFile, 'utf8')

    content = content.replace(/\s*?redirects: async \(\) => \{[\s\S]*?\},/g, '')

    // Existing removals
    fs.writeFileSync(nextConfigFile, content)
    consola.info(`Updated file: ${nextConfigFile}`)
  } catch (err) {
    consola.error(`Error processing file ${nextConfigFile}: ${err}`)
  }
}

export default removeTranslation
