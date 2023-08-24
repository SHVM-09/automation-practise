import path from 'path'
import { createDefu } from 'defu'
import fs from 'fs-extra'
import type { ImportItemInput } from 'magicast'
import { loadFile, writeFile } from 'magicast'
import type { PackageJson, TsConfigJson } from 'type-fest'

import type { GenPkgHooks } from '@types'
import { consola } from 'consola'
import { globbySync } from 'globby'
import { addNuxtModule, getDefaultExportOptions } from 'magicast/helpers'
import type { TemplateBaseConfig } from './config'
import { Utils } from './helper'

import { addImport } from '@/utils/file'
import { execCmd, readFileSyncUTF8, updateFile, writeFileSyncUTF8 } from '@/utils/node'
import { removePathPrefix } from '@/utils/paths'
import { TempLocation } from '@/utils/temp'

import '@/utils/injectMustMatch'

type Lang = 'ts' | 'js'
type LangConfigFile = 'tsconfig.json' | 'jsconfig.json'

interface Pkgs {
  devDependencies: string[]
  dependencies: string[]
}

export class Nuxt extends Utils {
  private projectPath: string
  private pkgsToInstall: Pkgs

  constructor(private templateConfig: TemplateBaseConfig) {
    super()

    this.projectPath = path.join(this.tempDir, this.templateConfig.nuxt.pkgName)
    this.pkgsToInstall = {
      devDependencies: [],
      dependencies: [],
    }
  }

  private genInstallPkgsCmd(pkgs: Pkgs): string {
    const { dependencies, devDependencies } = pkgs

    // Use from antfu utils after https://github.com/antfu/utils/pull/35
    const isEmpty = (val: unknown) => JSON.stringify(val) === '[]'

    const isDevDepsExist = !isEmpty(devDependencies)
    const idDepsExist = !isEmpty(dependencies)

    const installCmds: string[] = []

    if (isDevDepsExist)
      installCmds.push(`pnpm add -D ${devDependencies.join(' ')}`)
    if (idDepsExist)
      installCmds.push(`pnpm add ${dependencies.join(' ')}`)

    return installCmds.length
      ? installCmds.join(' && ')
      : 'echo \'\''
  }

  private initializePaths() {
    this.tempDir = new TempLocation().tempDir
    this.projectPath = path.join(this.tempDir, this.templateConfig.nuxt.pkgName)
  }

  private copyVueProjectFiles(sourcePath: string, isJS: boolean, lang: Lang) {
    this.copyProject(
      path.join(sourcePath, 'src'),
      this.projectPath,
    )

    // copy vue project's root files in laravel project
    const rootFilesToCopy = globbySync(
      ['*', '!package.json', '!tsconfig.json', '!index.html', '!.DS_Store'],
      {
        cwd: sourcePath,
        onlyFiles: true,
        deep: 0,
        absolute: true,
        dot: true,
      },
    )

    rootFilesToCopy.forEach((filePath) => {
      fs.copyFileSync(
        filePath,
        path.join(this.projectPath, path.basename(filePath)),
      )
    })

    // copy .vscode & eslint-internal-rules dir
    ;['.vscode', ...(isJS ? [] : ['eslint-internal-rules'])].forEach((dirName) => {
      fs.copySync(
        path.join(sourcePath, dirName),
        path.join(this.projectPath, dirName),
      )
    })

    // Copy vue project's public files in laravel project's public dir
    const publicFilesToCopy = globbySync(['*', '!loader.css'], {
      cwd: path.join(sourcePath, 'public'),
      dot: true,
      absolute: true,
    })
    publicFilesToCopy.forEach((filePath) => {
      fs.copyFileSync(
        filePath,
        path.join(this.projectPath, 'public', path.basename(filePath)),
      )
    })

    // Convert plugins to client only
    const pluginsDirPath = path.join(this.projectPath, 'plugins')
    const pluginsToConvert: string[] = [
      path.join(pluginsDirPath, `webfontloader.${lang}`),
    ]
    pluginsToConvert.forEach((filePath) => {
      fs.renameSync(filePath, filePath.mustReplace(`.${lang}`, `.client.${lang}`))
    })

    // Move error file to root in nuxt
    fs.moveSync(
      path.join(this.projectPath, 'pages', '[...error].vue'),
      path.join(this.projectPath, 'error.vue'),
    )
  }

  private updatePkgJson(sourcePath: string) {
    const pkgJSONFileName = 'package.json'

    const nuxtPkgJSONPath = path.join(this.projectPath, pkgJSONFileName)
    const vuePkgJSONPath = path.join(sourcePath, pkgJSONFileName)

    const nuxtPkgJson: PackageJson = fs.readJSONSync(nuxtPkgJSONPath)
    let vuePkgJSON: PackageJson = fs.readJSONSync(vuePkgJSONPath)

    // Override vue's package.json with nuxt's package.json & save content in nuxt package.json
    const defuNuxtPkgJson = createDefu((obj, key, value) => {
      if (key === 'postinstall') {
        obj[key] = `${value as string} && ${obj[key] as string}` as typeof obj[keyof typeof obj]

        return true
      }
    })
    vuePkgJSON = defuNuxtPkgJson(nuxtPkgJson, vuePkgJSON)

    // Update name
    vuePkgJSON.name = this.templateConfig.nuxt.pkgName

    // Remove typecheck script because in nuxt we use nuxt.config to enable type checking
    delete vuePkgJSON.scripts?.typecheck

    // Remove unwanted packages
    delete vuePkgJSON.dependencies?.['vue-router']
    delete vuePkgJSON.devDependencies?.['vue-tsc']

    delete vuePkgJSON.devDependencies?.['@vitejs/plugin-vue']
    delete vuePkgJSON.devDependencies?.['@vitejs/plugin-vue-jsx']

    delete vuePkgJSON.devDependencies?.['vite-plugin-vue-layouts']
    delete vuePkgJSON.devDependencies?.['vite-plugin-vue-devtools']

    delete vuePkgJSON.devDependencies?.['unplugin-vue-router']
    delete vuePkgJSON.devDependencies?.['unplugin-auto-import']
    delete vuePkgJSON.devDependencies?.['unplugin-vue-components']

    fs.writeJSONSync(nuxtPkgJSONPath, vuePkgJSON, {
      spaces: 2,
    })

    this.pkgsToInstall.devDependencies.push('@vueuse/nuxt')
  }

  private updatePlugins() {
    const pluginFiles = globbySync([
      'plugins/*.ts',
      'plugins/*/index.ts',
    ], {
      cwd: this.projectPath,
      onlyFiles: true,
      absolute: true,
    })

    pluginFiles.forEach((filePath) => {
      updateFile(
        filePath,
        // ℹ️ We are using replace for app.use because some plugins might have just import statement
        (data) => {
          let updatedData = data
            .mustReplace(
              /export default.*?\n(.*?)\n}/gms,
              'export default defineNuxtPlugin(nuxtApp => {\n$1\n})',
            )
            .replace('app.use', 'nuxtApp.vueApp.use')

          // If it's vuetify plugin then enable SSR
          if (filePath.includes('vuetify'))
            updatedData = updatedData.mustReplace(/(createVuetify\({(\s+))/gm, '$1ssr: true,$2')

          return updatedData
        },
      )
    })
  }

  private injectExtendedRoutesInNuxtConfig(sourcePath: string, lang: Lang) {
    // Create app directory
    const appDirPath = path.join(this.projectPath, 'app')
    fs.ensureDirSync(appDirPath)

    const routerPluginPath = path.join(this.projectPath, 'plugins', 'router')
    const additionalRoutesPath = path.join(routerPluginPath, `additional-routes.${lang}`)
    const routerFilePath = path.join(routerPluginPath, `index.${lang}`)

    const extendedRoutesStr = addImport(
      readFileSyncUTF8(additionalRoutesPath),
      'import type { RouterConfig } from \'@nuxt/schema\'',
    )
      // Replace vue-router/auto import with vue/router
      .mustReplace('vue-router/auto', 'vue-router')

      // Remove export keyword
      .mustReplace(/^export const/gm, 'const')

    const configContent = `${extendedRoutesStr}

      // https://router.vuejs.org/api/interfaces/routeroptions.html
      export default <RouterConfig> {
          routes: (scannedRoutes) => [
            ...redirects,
            ...routes,
            ...scannedRoutes,
        ],
      }`

    const routerOptionsFilePath = path.join(appDirPath, `router.options.${lang}`)
    writeFileSyncUTF8(routerOptionsFilePath, configContent)

    // updateFile(nuxtConfigPath, (data) => {
    //   const patternDynamicImports = /const (?<var>\w+) = \(\) => import\('(?<path>.*)'\)/g
    //   const matches = hooksStr.matchAll(patternDynamicImports)

    //   // Remove dynamic imports
    //   let hooksUpdatedStr = hooksStr.mustReplace(patternDynamicImports, '')

    //   if (!matches) {
    //     consola.error(new Error('Unable to find dynamic route imports in extended routes'))
    //     return ''
    //   }

    //   for (const match of matches) {
    //     if (!(match.groups?.var || match.groups?.path)) {
    //       consola.error(new Error('There is something wrong with dynamic route imports in extended routes'))
    //       return ''
    //     }

    //     // Remove matched dynamic import
    //     // hooksUpdatedStr = hooksUpdatedStr.replace(match[0], '')

    //     // Replace `component` property with `file` property
    //     hooksUpdatedStr = hooksUpdatedStr.mustReplace(`component: ${match.groups.var}`, `file: '${match.groups.path}'`)
    //   }

    //   // Remove dynamic imports from hook because we already added them in imports
    //   // ℹ️ IDK why using string `RouteRecordRaw[]` for must replace isn't working so I'm using regex instead
    //   const hooksStringified = hooksUpdatedStr.mustReplace(/RouteRecordRaw\[\]/gm, 'typeof pages')

    //   return data.replace(/hooks: {},/, hooksStringified)
    // })
  }

  private async updateNuxtConfig(sourcePath: string, lang: Lang, langConfigFile: LangConfigFile) {
    const nuxtConfigPath = path.join(this.projectPath, 'nuxt.config.ts')
    const nuxtConfigMod = await loadFile(nuxtConfigPath)

    const langConfigPath = path.join(sourcePath, langConfigFile)
    const langConfig: TsConfigJson = fs.readJsonSync(langConfigPath)

    const viteConfigPath = path.join(sourcePath, 'vite.config.ts')
    const viteConfigMod = await loadFile(viteConfigPath)
    const viteConfigStr = readFileSyncUTF8(viteConfigPath)
    const { plugins: _, ...viteConfig } = getDefaultExportOptions(viteConfigMod)

    nuxtConfigMod.exports.default.$args[0] = {
      components: {
        dirs: [
          '@/@core/components',
          '@/views/demos',

          // Defaults
          {
            path: '~/components/global',
            global: true,
          },
          '~/components',
        ],
      },
      plugins: [
        `@/plugins/casl/index.${lang}`,
        `@/plugins/vuetify/index.${lang}`,
        `@/plugins/i18n/index.${lang}`,
        `@/plugins/iconify/index.${lang}`,
      ],
      imports: {
        dirs: ['./@core/utils', './@core/composable/'],
      },
      hooks: {
        // We are adding hooks so that we can use them later for injecting code using easy regex
      },
      experimental: {
        typedPages: true,
      },
      typescript: {
        // This gives type error in generated package so we are disabling it for now
        // typecheck: true,
        tsConfig: {
          compilerOptions: {
            paths: langConfig.compilerOptions?.paths,
          },
          include: ['themeConfig.ts'],
          exclude: ['src/@iconify/*'],
        },
      },
      vite: {
        ...viteConfig,
        plugins: [],
      },
      build: {
        transpile: ['vuetify'],
      },
    }

    // Add modules
    addNuxtModule(nuxtConfigMod, '@vueuse/nuxt')

    // Add imports
    const importsToAdd: ImportItemInput[] = [
      { from: 'node:url', imported: 'fileURLToPath' },
      // { from: 'vite-plugin-vuetify', imported: 'default', local: 'vuetify' },
    ]
    importsToAdd.forEach((importItem) => {
      nuxtConfigMod.imports.$add(importItem)
    })

    await writeFile(nuxtConfigMod.$ast, nuxtConfigPath, {
      quote: 'single',
      trailingComma: true,
    })

    updateFile(
      nuxtConfigPath,
      (data) => {
        // Wrap single quotes where line starts with @. This was tricky but I'm magic baby!
        // ℹ️ Why? This is because when we add paths in nuxtConfig magicast don't wrap quotes and generated code becomes code with comment.
        // let newData = data.replace(/(?<= +)(@.*)(?=:)/gm, '\'$1\'')
        const newData = data.replace(/(?<= +)(@.*)(?=:)/gm, '\'$1\'')

        // Add vuetify plugin in vite.plugins property
        // const vuetifyPluginStr = viteConfigStr.match(/vuetify\({.*?}\),/gms)?.[0]

        // if (!vuetifyPluginStr) {
        //   consola.error(new Error('Unable to find vuetify plugin in vite config'))
        //   return
        // }

        // newData = newData.mustReplace(
        //   /plugins: \[],/gm,
        //   `plugins: [
        //     ${vuetifyPluginStr}
        //   ],`,
        // )

        return removePathPrefix(newData, 'src')
      },
    )
  }

  private convertBeforeEachToMiddleware(sourcePath: string, lang: Lang) {
    const routeGuardPath = path.join(sourcePath, 'src', 'plugins', 'router', `guards.${lang}`)

    const middlewareContent = readFileSyncUTF8(routeGuardPath)
      // Replace `setupGuards` & `router.beforeEach` with `defineNuxtRouteMiddleware`
      .mustReplace(/export const setupGuards.*?router.beforeEach(\(.*?}\)).*/gms, 'export default defineNuxtRouteMiddleware$1')

      // Use/Wrap `navigateTo` function instead of plain return in nuxt
      .mustReplace(/return ('.*'|{(\n|.)*?}$)/gm, 'return navigateTo($1)')

    const middlewareDirPath = path.join(this.projectPath, 'middleware')
    fs.ensureDirSync(middlewareDirPath)

    const middlewareFilePath = path.join(middlewareDirPath, `acl.global.${lang}`)
    writeFileSyncUTF8(middlewareFilePath, middlewareContent)
  }

  private replaceDefinePageWithDefinePageMeta() {
    // TODO: Use `sed` command instead of updating files via node
    const pagesDir = path.join(this.projectPath, 'pages')

    const findOutput = execCmd(`find ${pagesDir} -type f -exec grep -l "definePage({" {} +`, { encoding: 'utf-8' })
    const files = [
      ...(findOutput?.split('\n').filter(Boolean) || ''),
      path.join(this.projectPath, 'error.vue'),
    ]

    files?.forEach((filePath) => {
      updateFile(
        filePath,
        // https://regex101.com/r/xLPKPd/1
        (data) => {
          // Extract content from definePage macro
          const definePagePattern = /definePage\({\n +(?<content>.*?)\n}\)/ms
          const definePageContent = data.match(definePagePattern)?.groups?.content

          // Extract content from meta property and inject it in top level
          const metaContentPattern = /meta: {\n +(?<content>.*?)\s+},?/ms
          const definePageMetaContent = definePageContent?.replace(metaContentPattern, '$1') || ''

          // Replace definePage with definePageMeta
          return data.replace(definePagePattern, `definePageMeta({\n${definePageMetaContent}\n})`)
        },
      )
    })
  }

  private async replacePluginsWithModules(sourcePath: string, lang: Lang) {
    const pluginsDir = path.join(sourcePath, 'src', 'plugins')

    // Vuetify
    const vuetifyPluginFilePath = path.join(pluginsDir, 'vuetify', `index.${lang}`)
    const vuetifyPluginStr = readFileSyncUTF8(vuetifyPluginFilePath)

    // createVuetify options
    const createVuetifyOptions = await vuetifyPluginStr.mustMatch(/createVuetify\({(?<createVuetifyOptions>.*?)}\)/gms)

    // imports
    const importMatchResult = await vuetifyPluginStr.mustMatch(/(?<import>import [^'].*)/gm)
    const imports = Array.from(importMatchResult).map((match) => {
      const importStr = match.groups?.import

      if (!importStr)
        throw consola.error(new Error('Match found for import but unable to extract import string'))

      return importStr
    })

    // Add vuetify nuxt module to devDependencies
    this.pkgsToInstall.devDependencies.push('vuetify-nuxt-module')

    // Add vuetify module skelton in nuxt.config.ts
    const nuxtConfigPath = path.join(this.projectPath, 'nuxt.config.ts')
    const nuxtConfigMod = await loadFile(nuxtConfigPath)
    addNuxtModule(nuxtConfigMod, 'vuetify-nuxt-module', 'vuetify', {
      moduleOptions: {},
      vuetifyOptions: {},
    })
    // Write to file
    await writeFile(nuxtConfigMod.$ast, nuxtConfigPath, {
      quote: 'single',
      trailingComma: true,
    })

    let nuxtConfigStr = readFileSyncUTF8(nuxtConfigPath)

    // Add imports
    imports.forEach((importStr) => {
      nuxtConfigStr = addImport(
        nuxtConfigStr,

        // Change from relative import to absolute import. There might be some other imports so don't use `mustReplace`
        importStr.replace('./', './plugins/vuetify/'),
      )
    })

    // Inject createVuetify options
    const vuetifyOptionsStr = `vuetifyOptions: {${Array.from(createVuetifyOptions)[0].groups?.createVuetifyOptions as string}},`
    nuxtConfigStr = nuxtConfigStr.mustReplace(
      /vuetifyOptions: {},/gm,
      vuetifyOptionsStr,
    )

    // Inject module options
    const moduleOptionsStr = `moduleOptions: {
      styles: {
        configFile: 'assets/styles/variables/_vuetify.scss'
      }
    },`
    nuxtConfigStr = nuxtConfigStr.mustReplace(
      /moduleOptions: {},/gm,
      moduleOptionsStr,
    )

    writeFileSyncUTF8(nuxtConfigPath, nuxtConfigStr)
  }

  private async genNuxt(options?: { isSK?: boolean; isJS?: boolean; isFree?: boolean }) {
    /*
      ℹ️ Even though constructor of this class assigns the temp dir to the class we have to reinitialize the temp dir
      because `genNuxt` method is called multiple times after initializing the class once
    */
    this.initializePaths()

    const { isSK = false, isJS = false, isFree = false } = options || {}

    const sourcePath
      // If Free version
      = isFree
        ? isJS
          ? this.templateConfig.paths.freeJS
          : this.templateConfig.paths.freeTS

        // (Else) Premium
        : isJS
          // If JS Version
          ? isSK
            ? this.templateConfig.paths.jSStarter
            : this.templateConfig.paths.jSFull

          // (Else) TS Version
          : isSK
            ? this.templateConfig.paths.tSStarter
            : this.templateConfig.paths.tSFull

    const lang: Lang = isJS ? 'js' : 'ts'
    const langConfigFile: LangConfigFile = lang === 'ts' ? 'tsconfig.json' : 'jsconfig.json'

    // Create new nuxt project
    execCmd(
      `npx nuxi@latest init ${this.templateConfig.nuxt.pkgName}`,
      { cwd: this.tempDir },
    )

    // Open generated nuxt project in vscode
    execCmd(`code ${path.join(this.tempDir, this.templateConfig.nuxt.pkgName)}`)

    this.copyVueProjectFiles(sourcePath, isJS, lang)

    // update package.json
    this.updatePkgJson(sourcePath)

    // Remove src prefix from various files
    const filesToRemoveSrcPrefix = [
      path.join(this.projectPath, `vite.config.${lang}`),
      path.join(this.projectPath, 'package.json'),
      path.join(this.projectPath, langConfigFile),
      path.join(this.projectPath, '.eslintrc.js'),
      path.join(this.projectPath, '.gitignore'),
      path.join(this.projectPath, 'plugins', 'iconify', `build-icons.${lang}`),
      path.join(this.projectPath, 'plugins', 'router', `index.${lang}`),
    ]
    filesToRemoveSrcPrefix.forEach((filePath) => {
      updateFile(
        filePath,
        data => removePathPrefix(data, 'src'),
      )
    })

    // Update plugins to use defineNuxtPlugin
    this.updatePlugins()

    // Update nuxt.config.ts
    await this.updateNuxtConfig(sourcePath, lang, langConfigFile)
    this.injectExtendedRoutesInNuxtConfig(sourcePath, lang)

    this.convertBeforeEachToMiddleware(sourcePath, lang)

    // Remove unwanted files
    fs.removeSync(path.join(this.projectPath, 'vite.config.ts'))
    fs.removeSync(path.join(this.projectPath, 'plugins', 'router'))

    // Rename definePage to definePageMeta
    this.replaceDefinePageWithDefinePageMeta()

    // Replace plugins with modules
    await this.replacePluginsWithModules(sourcePath, lang)

    // Install additional packages
    const installPkgCmd = this.genInstallPkgsCmd(this.pkgsToInstall)
    consola.start('Installing packages...')
    execCmd(installPkgCmd, { cwd: this.projectPath })

    // Install all packages
    consola.start('Installing all packages...')
    execCmd('pnpm install', { cwd: this.projectPath })

    // Run lint to fix linting errors
    consola.start('Linting the code...')
    execCmd('pnpm run lint', { cwd: this.projectPath })

    // TODO: Remove eslint internal rules. I suggest creating separate utility function because we are doing this at multiple places

    consola.success('You are ready to rock baby!')
  }

  async genPkg(hooks: GenPkgHooks, isInteractive = true, newPkgVersion?: string) {
    await this.genNuxt()
  }
}