import path from 'node:path'
import * as url from 'node:url'
import { createDefu } from 'defu'
import fs from 'fs-extra'
import type { ImportItemInput } from 'magicast'
import { loadFile, writeFile } from 'magicast'
import type { GenPkgHooks } from '@types'
import type { PackageJson, TsConfigJson } from 'type-fest'

import { consola } from 'consola'
import { globbySync } from 'globby'
import { addNuxtModule, getDefaultExportOptions } from 'magicast/helpers'
import type { TemplateBaseConfig } from './config'
import { Utils } from './helper'
import { execCmd, filterFileByLine, readFileSyncUTF8, replaceDir, updateFile, updateJSONFileField, writeFileSyncUTF8 } from '@/utils/node'

import { titleCase } from '@/utils/conversions'
import { addImport, addSfcImport, mergeEnvFiles, removeCaretTildeFromPackageJson } from '@/utils/file'
import '@/utils/injectMustMatch'
import { getTemplatePath, removePathPrefix } from '@/utils/paths'
import { TempLocation } from '@/utils/temp'
import { updatePkgJsonVersion } from '@/utils/template'

type Lang = 'ts' | 'js'
type LangConfigFile = 'tsconfig.json' | 'jsconfig.json'

interface Pkgs {
  devDependencies: string[]
  dependencies: string[]
}

export class Nuxt extends Utils {
  private projectPath: string
  private pkgsToInstall: Pkgs

  constructor(private templateConfig: TemplateBaseConfig, private isFree: boolean = false) {
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

  private async copyVueProjectFiles(sourcePath: string, isJS: boolean, lang: Lang, isSK: boolean) {
    this.copyProject(
      path.join(sourcePath, 'src'),
      this.projectPath,
    )

    // remove main.ts
    const thingsToRemove = [
      path.join(this.projectPath, `main.${lang}`),
      ...(
        isSK
          ? [
              path.join(this.projectPath, 'plugins', 'casl'),
              path.join(this.projectPath, 'plugins', 'i18n'),
            ]
          : []
      ),
      path.join(this.projectPath, 'plugins', 'fake-api'),
      path.join(this.projectPath, '@core', 'composable', `useCookie.${lang}`),
    ]
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    thingsToRemove.map(async (thing) => {
      await fs.remove(thing)
    })

    // copy vue project's root files in nuxt project
    const rootFilesToIgnoreForCopy = [
      'package.json',
      'tsconfig.json',
      'index.html',
      '.DS_Store',
      '.gitignore',
      'auto-imports.d.ts',
      'components.d.ts',
      'typed-router.d.ts',
      '.dockerignore',
      'dev.Dockerfile',
      'docker-compose.dev.yml',
      'docker-compose.prod.yml',
      'nginx.conf',
      'prod.Dockerfile',
    ]
    const rootFilesToCopy = globbySync(
      ['*', ...rootFilesToIgnoreForCopy.map(f => `!${f}`)],
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

    // Merge gitignore file
    const sourceGit = readFileSyncUTF8(path.join(sourcePath, '.gitignore'))
    const projectGitIgnorePath = path.join(this.projectPath, '.gitignore')
    const customIgnores = Array.from(await sourceGit.mustMatch(/^(?<customIgnores># 👉 Custom Git ignores.*)/gms))[0].groups?.customIgnores

    if (!customIgnores)
      throw consola.error(new Error('Unable to find custom git ignores in source gitignore file'))

    updateFile(projectGitIgnorePath, data => `${data}\n${customIgnores}`)

    // copy .vscode dir
    ;['.vscode'].forEach((dirName) => {
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

    // Add server plugin to fix the vuetify SASS issue
    const serverPluginsDir = path.join(this.projectPath, 'server', 'plugins')
    fs.ensureDirSync(serverPluginsDir)

    const vuetifyServerPluginPath = path.join(serverPluginsDir, `vuetify.fix.${lang}`)
    writeFileSyncUTF8(vuetifyServerPluginPath, `export default defineNitroPlugin((nitroApp${!isJS ? ': any' : ''}) => {
  nitroApp.hooks.hook("render:response", (response${!isJS ? ': any' : ''}) => {
    response.body = response.body.replaceAll("/_nuxt/\\0", "/_nuxt/");
  });
});`)

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
        // Append vue's postinstall script in nuxt's postinstall script and remove msw initialization
        obj[key] = `${value as string} && ${(obj[key] as string).replace('&& npm run msw:init', '')}` as typeof obj[keyof typeof obj]

        return true
      }
    })
    vuePkgJSON = defuNuxtPkgJson(nuxtPkgJson, vuePkgJSON)

    // Update name
    vuePkgJSON.name = this.templateConfig.nuxt.pkgName

    // Update build script to avoid heap out of memory error
    vuePkgJSON.scripts = vuePkgJSON.scripts || {}
    vuePkgJSON.scripts.build = 'node --max-old-space-size=4096 node_modules/nuxt/bin/nuxt.mjs build'

    // TODO: Remove this after nuxt fix the 3.4.0 version issue now using vue 3.3.13
    vuePkgJSON.resolutions.vue = '3.3.13'
    vuePkgJSON.overrides.vue = '3.3.13'
    vuePkgJSON.devDependencies.vue = '3.3.13'
    delete vuePkgJSON.dependencies.vue

    // Remove typecheck script because in nuxt we use nuxt.config to enable type checking
    delete vuePkgJSON.scripts.typecheck

    // Remove preview script as this is not needed in nuxt
    delete vuePkgJSON.scripts.preview

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

    // Remove msw
    delete vuePkgJSON.scripts['msw:init']
    delete vuePkgJSON.msw
    delete vuePkgJSON.devDependencies?.['msw']

    fs.writeJSONSync(nuxtPkgJSONPath, vuePkgJSON, {
      spaces: 2,
    })

    this.pkgsToInstall.devDependencies.push('@vueuse/nuxt')
  }

  private updatePlugins(isSK: boolean, lang: Lang) {
    // Remove pinia plugin because we are using pinia nuxt module
    const piniaFileName = (this.isFree ? 'pinia.' : '2.pinia.') + lang
    fs.removeSync(path.join(this.projectPath, 'plugins', piniaFileName))

    const pluginFiles = globbySync([
      `plugins/*.${lang}`,
      `plugins/*/index.${lang}`,
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

          // If nuxtApp callback function parameter is not used remove nuxtApp
          if (!updatedData.includes('nuxtApp.'))
            updatedData = updatedData.mustReplace(/nuxtApp/gm, '()')

          if (filePath.includes('iconify')) {
            // Remove icons.css import from entry file
            updatedData = updatedData.mustReplace('import \'./icons.css\'', '')
          }

          // If it's vuetify plugin then enable SSR
          if (filePath.includes('plugins/vuetify'))
            updatedData = updatedData.mustReplace(/(createVuetify\({(\s+))/gm, '$1ssr: true,$2')

          return updatedData
        },
      )
    })
  }

  private updateAdditionalRoutes(sourcePath: string, lang: Lang) {
    // Create app directory
    const appDirPath = path.join(this.projectPath, 'app')
    fs.ensureDirSync(appDirPath)

    const routerPluginPath = path.join(this.projectPath, 'plugins', '1.router')
    const additionalRoutesPath = path.join(routerPluginPath, `additional-routes.${lang}`)

    const extendedRoutesStr = addImport(
      readFileSyncUTF8(additionalRoutesPath),
      lang === 'ts' ? 'import type { RouterConfig } from \'@nuxt/schema\'' : '',
    )
      // Replace vue-router/auto import with vue/router
      // ℹ️ We are importing type via vue-router/auto and this import might not be available in JS version so we are using `replace`
      .replace('vue-router/auto', 'vue-router')

      // Remove export keyword
      .mustReplace(/^export const/gm, 'const')

      // Use meta.middleware instead of redirect [Note: h('div') is workaround to avoid type error]
      .mustReplace(
        /(?<=name: 'index',\s+)redirect:( to => {.*?)(?=\s+},\s+{\s+path:)/gms,
        'meta: {\nmiddleware:$1\n},\ncomponent: h(\'div\'),',
      )

    const configContent = `${extendedRoutesStr}

      // https://router.vuejs.org/api/interfaces/routeroptions.html
      export default ${lang === 'ts' ? '<RouterConfig>' : ''}{
          routes: (scannedRoutes) => [
            ...redirects,
            ...routes,
            ...scannedRoutes,
        ],
        scrollBehaviorType: 'smooth',
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

  private async updateNuxtConfig(sourcePath: string, lang: Lang, langConfigFile: LangConfigFile, isSk: boolean, isFree: boolean) {
    const nuxtConfigPath = path.join(this.projectPath, 'nuxt.config.ts')
    const nuxtConfigMod = await loadFile(nuxtConfigPath)

    const langConfigPath = path.join(sourcePath, langConfigFile)
    const langConfig: TsConfigJson = fs.readJsonSync(langConfigPath)

    const viteConfigPath = path.join(sourcePath, `vite.config.${lang}`)
    const viteConfigMod = await loadFile(viteConfigPath)
    const viteConfigStr = readFileSyncUTF8(viteConfigPath)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { plugins: _, ...viteConfig } = getDefaultExportOptions(viteConfigMod)

    // Replace relative path to "./src" dir with "../src" dir. Later src dir will be removed as prefix
    const vueTsConfigPaths = langConfig.compilerOptions?.paths || {}
    const nuxtTsConfigPaths: Exclude<TsConfigJson['compilerOptions'], undefined>['paths'] = {}
    for (const pathAlias in vueTsConfigPaths)
      nuxtTsConfigPaths[pathAlias] = vueTsConfigPaths[pathAlias].map((path: string) => path.replace('./', '../'))

    nuxtConfigMod.exports.default.$args[0] = {
      app: {
        head: {
          titleTemplate: '%s - NuxtJS Admin Template',
          title: titleCase(this.templateConfig.templateName),
          link: [
            {
              rel: 'icon',
              type: 'image/x-icon',
              href: '/favicon.ico',
            },
          ],
        },
      },
      devtools: { enabled: true },
      css: [
        '@core/scss/template/index.scss',
        '@styles/styles.scss',
        '@/plugins/iconify/icons.css',
        ...(isFree ? ['@layouts/styles/index.scss'] : []),
      ],
      components: {
        dirs: [
          {
            path: '@/@core/components',
            pathPrefix: false,
          },
          ...(
            (isSk || isFree)
              ? []
              : [{
                  path: '@/views/demos',
                  pathPrefix: false,
                }]
          ),

          // Defaults
          {
            path: '~/components/global',
            global: true,
          },
          {
            path: '~/components',
            pathPrefix: false,
          },
        ],
      },
      ...(
        (isSk || isFree)
          ? {}
          : {
              auth: {
                baseURL: 'process.env.AUTH_ORIGIN',
                globalAppMiddleware: false,
                provider: {
                  type: 'authjs',
                },
              },
            }
      ),
      plugins: [
        ...((isSk || isFree) ? [] : [`@/plugins/casl/index.${lang}`]),
        `@/plugins/vuetify/index.${lang}`,
        ...((isSk || isFree) ? [] : [`@/plugins/i18n/index.${lang}`]),
        `@/plugins/iconify/index.${lang}`,
      ],
      imports: {
        dirs: ['./@core/utils', './@core/composable/', './plugins/*/composables/*'],
        presets: [...((isSk || isFree) ? [] : ['vue-i18n'])],
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
            paths: nuxtTsConfigPaths,
          },
        },
      },
      // ℹ️ Disable source maps until this is resolved: https://github.com/vuetifyjs/vuetify-loader/issues/290
      sourcemap: {
        server: false,
        client: false,
      },
      vue: {
        compilerOptions: {},
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

    // Device module
    addNuxtModule(nuxtConfigMod, '@nuxtjs/device')
    this.pkgsToInstall.devDependencies.push('@nuxtjs/device')

    if (!(isSk || isFree))
      addNuxtModule(nuxtConfigMod, '@sidebase/nuxt-auth')

    // Add pinia
    this.pkgsToInstall.devDependencies.push('@pinia/nuxt')
    addNuxtModule(nuxtConfigMod, '@pinia/nuxt')

    // Add imports
    const importsToAdd: ImportItemInput[] = [
      { from: 'node:url', imported: 'fileURLToPath' },
      { from: 'vite-plugin-vuetify', imported: 'default', local: 'vuetify' },
      { from: 'vite-svg-loader', imported: 'default', local: 'svgLoader' },
    ]

    // Don't include vue-i18n in imports if it's free version
    if (!isFree)
      importsToAdd.push({ from: '@intlify/unplugin-vue-i18n/vite', imported: 'default', local: 'VueI18nPlugin' })

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
        let newData = data.replace(/(?<= +)(@.*)(?=:)/gm, '\'$1\'')

        // Add vuetify plugin in vite.plugins property
        const vuetifyPluginStr = viteConfigStr.match(/vuetify\({.*?}\),/gms)?.[0]
        const i18nPluginStr = viteConfigStr.match(/VueI18nPlugin\({.*?}\),/gms)?.[0]

        if (!vuetifyPluginStr)
          throw consola.error(new Error('Unable to find vuetify plugin in vite config'))

        if (!(isSk || isFree) && !i18nPluginStr)
          throw consola.error(new Error('Unable to find i18n in vite config'))

        newData = newData.mustReplace(
          /plugins: \[],/gm,
          `plugins: [
            svgLoader(),
            ${vuetifyPluginStr}
            ${(isSk || isFree) ? null : i18nPluginStr}
          ],`,
        )

        // add ssr true for vue i18n
        if (!(isSk || isFree))
          newData = newData.mustReplace('compositionOnly: true,', 'compositionOnly: true, ssr: true,')

        newData = newData.mustReplace(
          /vue:\s{\n\s+(.)compilerOptions:\s{},\n\s+},/gm,
          `vue: {
            compilerOptions: {
              isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
            },
          },`,
        )

        // Add sourcemap comment
        newData = newData.mustReplace(
          /(\n +sourcemap: {)/gm,
          '// ℹ️ Disable source maps until this is resolved: https://github.com/vuetifyjs/vuetify-loader/issues/290$1',
        )

        // Add runtimeConfig for baseUrl
        if (!(isSk || isFree)) {
          newData = newData.mustReplace(
            'components: {',
          `/*
    ❗ Please read the docs before updating runtimeConfig
    https://nuxt.com/docs/guide/going-further/runtime-config
  */
  runtimeConfig: {
    // Private keys are only available on the server
    AUTH_ORIGIN: process.env.AUTH_ORIGIN,
    AUTH_SECRET: process.env.AUTH_SECRET,

    // Public keys that are exposed to the client.
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
    },
  },
  components: {`,
          )
          // Update baseUrl for api
          newData = newData.mustReplace(
            '\'process.env.AUTH_ORIGIN\'',
            'process.env.AUTH_ORIGIN',
          )
        }

        // We don't have server in Free version
        if (!isFree) {
          // Replace API paths in tsconfig aliases & Vite aliases
          newData = newData
            .mustReplace('plugins/fake-api/utils/', 'server/utils/')
            .mustReplace('plugins/fake-api/handlers/', 'server/fake-db/')
        }

        return removePathPrefix(newData, 'src')
      },
    )
  }

  private convertBeforeEachToMiddleware(sourcePath: string, lang: Lang) {
    const routeGuardPath = path.join(sourcePath, 'src', 'plugins', '1.router', `guards.${lang}`)

    const middlewareContent = readFileSyncUTF8(routeGuardPath)
      // Replace `setupGuards` & `router.beforeEach` with `defineNuxtRouteMiddleware`
      .mustReplace(/export const setupGuards.*?router.beforeEach(\(.*?}\)).*/gms, 'export default defineNuxtRouteMiddleware$1')

      // Replace vue's isLoggedIn check with nuxt module
      .mustReplace(
        /\/\*\*.*?const isLoggedIn.*?\n/gms,
        `const { status } = useAuth()
  const isLoggedIn = status.value === 'authenticated'`,
      )

      // Use/Wrap `navigateTo` function instead of plain return in nuxt
      .mustReplace(/return (\w+\s+\? .*?(?:}|')\s+:\s.*?(?:(?:}|')$|true)|'.*?')/gms, 'return navigateTo($1)')

    // Add Vuetify SASS escape temporary
    // .mustReplace(/(to => {)/gm, '$1\nif (to.path.endsWith(\'.sass\'))\nreturn')

    const middlewareDirPath = path.join(this.projectPath, 'middleware')
    fs.ensureDirSync(middlewareDirPath)

    const middlewareFilePath = path.join(middlewareDirPath, `acl.global.${lang}`)
    writeFileSyncUTF8(middlewareFilePath, middlewareContent)
  }

  private replaceDefinePageWithDefinePageMeta() {
    const findOutput = execCmd('fd -e vue -t f -X grep -l "definePage"', { encoding: 'utf-8', cwd: this.projectPath })

    const files = [
      ...(findOutput?.split('\n').filter(Boolean) || ''),
      'error.vue',
    ]

    files?.forEach((filePath) => {
      updateFile(
        path.join(this.projectPath, filePath),
        // https://regex101.com/r/xLPKPd/1
        (data) => {
          // Extract content from definePage macro
          const definePagePattern = /definePage\({\s+(?<content>.*?)}\)/ms
          const definePageContent = data.match(definePagePattern)?.groups?.content

          // Extract content from meta property and inject it in top level
          const metaContentPattern = /meta: {\s+(?<content>.*?)\s+},?/ms
          const definePageMetaContent = definePageContent?.replace(metaContentPattern, '$1') || ''

          // Replace definePage with definePageMeta
          return data.replace(definePagePattern, `definePageMeta({\n${definePageMetaContent}\n})`)
        },
      )
    })
  }

  private update404Page(isJS: boolean) {
    const page404Path = path.join(this.projectPath, 'error.vue')

    updateFile(
      page404Path,
      (data) => {
        let newData = data.mustReplace(
          /<template>(.*)<\/template>/gms,
          '<template>\n<NuxtLayout name="blank">$1</NuxtLayout>\n</template>',
        )

        if (!this.isFree) {
          newData = newData.mustReplace(
            /definePage.*?}\)/gms,
            '',
          )
        }

        if (!isJS) {
          newData = newData.mustReplace(
            /(<script.*)/gm,
            '$1\nimport type { NuxtError } from \'nuxt/app\'',
          )
        }
        // newData = addImport(newData, 'import type { NuxtError } from \'nuxt/app\'')

        // Make errorHeader props dynamic by rendering error from Error prop
        newData = newData.mustReplace(
          /status-code=".*"/gm,
          ':status-code="props.error.statusCode"',
        ).mustReplace(
          /title=".*"/gm,
          ':title="errToShow.title"',
        ).mustReplace(
          /description=".*"/gm,
          ':description="errToShow.description"',
        )

        // Render error stack in dev mode
        newData = newData.mustReplace(
          /(<ErrorHeader.*?\/>)/gms,
          `$1

<!-- eslint-disable vue/no-v-html -->
<div
  v-if="isDev"
  style="max-inline-size: 80dvw; overflow-x: scroll;"
  v-html="error.stack"
/>
<!-- eslint-enable -->`,
        )

        const additionalSetupContent = `${isJS
? `const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
})`
 : `const props = defineProps<{
  error: NuxtError
}>()`} 

defineOptions({
  inheritAttrs: false,
})

const isDev = process.dev

const errToShow = computed(() => {
  const is404 = props.error?.statusCode === 404 || props.error.message?.includes('404')

  if (is404) {
    return {
      title: 'Page Not Found',
      description: 'We couldn\\'t find the page you are looking for.',
    }
  }

  else if (isDev) {
    return {
      title: props.error?.statusMessage,
      description: props.error.message,
    }
  }

  return {
    title: 'Oops! Something went wrong.',
    description: 'We are working on it and we\\'ll get it fixed as soon as we can',
  }
})

const handleError = () => clearError({ redirect: '/' })
`

        newData = newData.mustReplace(
          /(<\/script>)/gm,
          `${additionalSetupContent}$1`,
        ).mustReplace(
          /to="\/"/gm,
          '@click="handleError"',
        )

        return newData
      },
    )
  }

  private remove404PageNavLink(lang: Lang) {
    const linksFilePath = [
      path.join(this.projectPath, 'navigation', 'vertical', `apps-and-pages.${lang}`),
      path.join(this.projectPath, 'navigation', 'horizontal', `pages.${lang}`),
    ]

    linksFilePath.forEach((filePath) => {
      updateFile(
        filePath,
        data => data.mustReplace(/.*Page Not Found.*\n/gm, ''),
      )
    })
  }

  private updateLayouts(lang: Lang, isFree: boolean) {
    const layoutsDirPath = path.join(this.projectPath, 'layouts')
    const defaultLayoutWithVerticalNavPath = path.join(layoutsDirPath, 'components', 'DefaultLayoutWithVerticalNav.vue')
    const layoutsPaths = [
      path.join(layoutsDirPath, 'blank.vue'),
    ]

    if (isFree) {
      layoutsPaths.push(
        path.join(layoutsDirPath, 'default.vue'),
      )
    }
    else {
      layoutsPaths.push(
        defaultLayoutWithVerticalNavPath,
        path.join(layoutsDirPath, 'components', 'DefaultLayoutWithHorizontalNav.vue'),
      )
    }

    const modifyLayout = (layoutFilePath: string) => {
      updateFile(layoutFilePath, (data) => {
        // Handle both definition of <RouterView>
        let newData = data.replace(/<RouterView.*?<\/RouterView>/gms, '<slot />')
        newData = newData.replace(/<RouterView \/>/gms, '<slot />')

        if (!isFree) {
          newData = newData
            .mustReplace(/\/\/ SECTION: Loading Indicator.*\/\/ !SECTION/gms, '')
            .mustReplace(/<AppLoadingIndicator.*/gm, '')
        }

        return newData
      })
    }

    layoutsPaths.forEach(modifyLayout)

    if (isFree) {
      // ℹ️ Update GitHub repo URL in navbar in Free
      updateFile(
        defaultLayoutWithVerticalNavPath,
        data => data.mustReplace(
          'https://github.com/themeselection/materio-vuetify-vuejs-admin-template-free',
          'https://github.com/themeselection/materio-vuetify-nuxtjs-admin-template-free',
        ),
      )

      // Update pro links
      ;[
        path.join(layoutsDirPath, 'components', 'NavItems.vue'),
        path.join(this.projectPath, 'components', 'UpgradeToPro.vue'),
      ].forEach((filePath) => {
        updateFile(
          filePath,

          // Update URLs and revert back docs URL
          data => data.mustReplace(
            'materio-vuetify-vuejs-admin-template',
            'materio-vuetify-nuxtjs-admin-template',
          ).replace(
            'materio-vuetify-nuxtjs-admin-template/documentation',
            'materio-vuetify-vuejs-admin-template/documentation',
          ),
        )
      })
    }

    // Replace RouterView with NuxtLayout, NuxtPage & Loading indicator & SSR updates
    updateFile(
      path.join(this.projectPath, 'app.vue'),
      data => data
        .mustReplace(
          '<RouterView />',
          `<NuxtLayout>
            <NuxtPage />
          </NuxtLayout>`,
        )

        // Get isMobile from $device for SSR
        .mustReplace(
          '</script>',
          `const { isMobile } = useDevice()
if (isMobile)
  configStore.appContentLayoutNav = 'vertical'
</script>`,
        ),
    )

    if (!isFree) {
      // Insert `<slot />` in self closing `Component` tag
      const defaultLayoutPath = path.join(layoutsDirPath, 'default.vue')
      updateFile(
        defaultLayoutPath,
        data => data.mustReplace(
          /(?<=<Component.*?)\/>/gms,
          '>\n<slot />\n</Component>',
        ),
      )
    }

    // src/@layouts/utils.ts
    // https://regex101.com/r/awgAHv/1
    if (!isFree) {
      updateFile(
        path.join(this.projectPath, '@layouts', `utils.${lang}`),
        data => data
          .mustReplace(
            /(?<=watch.*?configStore\.isLessThanOverlayNavBreakpoint.*?\n).*?(?=\s+}, { immediate: true }\))/gm,
          `if (!val) {
          configStore.appContentLayoutNav = lgAndUpNav.value
        }
        else {
          if (!shouldChangeContentLayoutNav.value) {
            setTimeout(() => {
              configStore.appContentLayoutNav = AppContentLayoutNav.Vertical
            }, 500)
          }
          else {
            configStore.appContentLayoutNav = AppContentLayoutNav.Vertical
          }
        }`,
          )
          .mustReplace(
            /watch\(\(\) => configStore.isLessThanOverlayNavBreakpoint/gm,
              `const shouldChangeContentLayoutNav = refAutoReset(true, 500)

        shouldChangeContentLayoutNav.value = false

        watch(() => configStore.isLessThanOverlayNavBreakpoint`,
          ),
      )
    }
  }

  private copyServerApi(isJS: boolean) {
    // Paths
    const templateServerApiRepoPath = getTemplatePath(this.templateConfig.templateName, isJS ? 'nuxt-api-js' : 'nuxt-api')
    const templateServerApiPath = path.join(templateServerApiRepoPath, 'server')

    const serverDirPath = path.join(this.projectPath, 'server')

    // Copy server dir
    fs.copySync(templateServerApiPath, serverDirPath)
    // replaceDir(masterServerApiPath, serverDirPath)

    // Paths
    const templateImgDir = path.join(templateServerApiRepoPath, 'public', 'images')
    const projectImgDir = path.join(this.projectPath, 'public', 'images')

    // If master template then replace images dir from public
    if (this.templateConfig.templateName === 'master') {
      replaceDir(
        path.join(templateServerApiRepoPath, 'public', 'images'),
        projectImgDir,
      )

      return
    }

    // If images dir for template doesn't exist then throw error
    if (!fs.existsSync(templateImgDir))
      throw consola.error(new Error(`Unable to find images dir: ${templateImgDir}`))

    // NOTE: We don't know ATM if we need to raise this error
    // Check number of files inside `templateImgDir` dir matches`projectImgDir` dir
    // const getNumberOfFiles = (dirPath: string) => globbySync(['*'], {
    //   cwd: dirPath,
    //   onlyFiles: true,
    // }).length
    // if (getNumberOfFiles(templateImgDir) !== getNumberOfFiles(projectImgDir))
    //   throw consola.error(new Error(`Number of files in ${templateImgDir} doesn't match ${projectImgDir}`))

    // Replace images dir
    replaceDir(templateImgDir, projectImgDir)
  }

  private handleRouterChanges() {
    // Change RouterLink to NuxtLink
    execCmd('fd --type file --exec sd RouterLink NuxtLink', { cwd: this.projectPath })

    // Add import statement for NuxtLink as it can't be resolved like a RouterLink
    const fileWithDynamicNuxtLink = execCmd('grep -rl "\'NuxtLink\'" --exclude-dir=.nuxt | xargs realpath', { cwd: this.projectPath, encoding: 'utf-8' })?.split('\n').filter(Boolean)
    fileWithDynamicNuxtLink?.forEach((filePath) => {
      updateFile(
        filePath,
        (data) => {
          const newData = data.mustReplace(/'NuxtLink'/gm, 'NuxtLink')
          return addSfcImport(newData, 'import { NuxtLink } from \'#components\'')
        },
      )
    })

    // Change `router.push` to `navigateTo`
    // const filesWithRouterPush = execCmd('grep -rl "router\.push" --exclude-dir={.nuxt,node_modules} | xargs realpath', { cwd: this.projectPath, encoding: 'utf-8' })?.split('\n').filter(Boolean) || []
    // console.log('filesWithRouterPush :>> ', filesWithRouterPush)
    execCmd('fd --type file --exec sd "\$?router\.push" "navigateTo"', { cwd: this.projectPath })
    // filesWithRouterPush.forEach(filePath => removeUnusedRouter(filePath))

    // Replace `router.replace` content with `navigateTo` + { replace: true }
    // const filesWithRouterReplace = execCmd('grep -rl "router\.replace" --exclude-dir={.nuxt,node_modules} | xargs realpath', { cwd: this.projectPath, encoding: 'utf-8' })?.split('\n').filter(Boolean) || []
    execCmd('fd --type file --exec sd \'\$?router\.replace\((.*)\)\' \'navigateTo($1, { replace: true })\'', { cwd: this.projectPath })
    // filesWithRouterReplace.forEach(filePath => removeUnusedRouter(filePath))

    // Remove unused router assignment
    const routerComposableStr = 'const router = useRouter()'
    const filesWithRouter = execCmd(`grep -rl "${routerComposableStr}" --exclude-dir={.nuxt,node_modules} | xargs realpath`, { cwd: this.projectPath, encoding: 'utf-8' })?.split('\n').filter(Boolean) || []

    // Check if router word exist in file more than once
    filesWithRouter.forEach((filePath) => {
      const fileContent = readFileSyncUTF8(filePath)
      if (fileContent.match(/router/g)?.length > 1)
        return

      // Remove router usage
      updateFile(
        filePath,
        data => data.mustReplace(routerComposableStr, ''),
      )
    })
  }

  private async updateCustomRouteMeta(sourcePath: string) {
    // Nuxt Docs: https://nuxt.com/docs/guide/directory-structure/pages/#typing-custom-metadata
    const vueRouteMetaFilePath = path.join(sourcePath, 'env.d.ts')
    const vueRouteMetaFileContent = readFileSyncUTF8(vueRouteMetaFilePath)
    const routeMeta = Array.from(await vueRouteMetaFileContent.mustMatch(/interface RouteMeta {(?<meta>.*?)}/gms))[0].groups?.meta

    if (!routeMeta)
      throw consola.error(new Error('Unable to find route meta in env.d.ts file'))

    // We are removing layout route meta because layout is now handled by nuxt
    const nuxtRouteMeta = routeMeta.mustReplace(/layout\?:.*/gm, '')
    const nuxtRouteMetaFilePath = path.join(this.projectPath, 'index.d.ts')
    writeFileSyncUTF8(
      nuxtRouteMetaFilePath,
      `declare module '#app' {
  interface PageMeta {${nuxtRouteMeta}}
}

// It is always important to ensure you import/export something when augmenting a type
export {}`,
    )
  }

  private useNuxtFetch(isJS: boolean, lang: Lang) {
    // pattern: createUrl\((.*?}\))\)

    // Remove `createUrl` usage from fetch hook using fd
    // eslint-disable-next-line @typescript-eslint/quotes
    execCmd(`fd --type file --exec sd 'createUrl\\((.*?}\\))\\)' '$1'`, { cwd: this.projectPath })

    // update .env & .env.example files
    ;[
      path.join(this.projectPath, '.env'),
      path.join(this.projectPath, '.env.example'),
    ].forEach((filePath) => {
      // Create if doesn't exist in vue version
      fs.ensureFileSync(filePath)

      updateFile(
        filePath,
        () => filePath.includes('example')
          ? 'NUXT_PUBLIC_API_BASE_URL='
          : 'NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api',
      )
    })

    // Update `useApi`
    writeFileSyncUTF8(
      path.join(this.projectPath, 'composables', `useApi.${lang}`),
      `import { defu } from 'defu'
${!isJS ? 'import type { UseFetchOptions } from \'nuxt/app\'' : ''}

export const useApi${!isJS ? ': typeof useFetch' : ''}= ${!isJS ? '<T>' : ''}(url${!isJS ? ': MaybeRefOrGetter<string>' : ''}, options${!isJS ? ': UseFetchOptions<T>' : ''} = {}) => {
  const config = useRuntimeConfig()
  const accessToken = useCookie('accessToken')

  const defaults${!isJS ? ': UseFetchOptions<T>' : ''} = {
    baseURL: config.public.apiBaseUrl,
    key: toValue(url),
    headers: accessToken.value ? { Authorization: \`Bearer \${accessToken.value}\` } : {},
  }

  // for nice deep defaults, please use unjs/defu
  const params = defu(options, defaults)

  return useFetch(url, params)
}`,
    )

    // update `$api`
    writeFileSyncUTF8(
      path.join(this.projectPath, 'utils', `api.${lang}`),
      `export const $api = $fetch.create({

  // Request interceptor
  async onRequest({ options }) {
    // Set baseUrl for all API calls
    options.baseURL = useRuntimeConfig().public.apiBaseUrl || '/api'

    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: \`Bearer \${accessToken}\`,
      }
    }
  },
})
`,
    )
  }

  private useAuthModule(isJS: boolean, lang: Lang) {
    // Add sidebase nuxt auth module & next-auth
    this.pkgsToInstall.devDependencies.push('@sidebase/nuxt-auth')
    this.pkgsToInstall.dependencies.push('next-auth@4.21.1')

    // Update login file
    const loginFilePath = path.join(this.projectPath, 'pages', 'login.vue')
    updateFile(
      loginFilePath,
      (data) => {
        const newData = addSfcImport(data, `${!isJS ? 'import type { NuxtError } from \'nuxt/app\'\nimport type { User } from \'next-auth\'\n\n' : ''}const { signIn, data: sessionData } = useAuth()\n\n`)
        return newData.mustReplace(
          /const login.*?\n}/gms,
          `async function login() {
  const response = await signIn('credentials', {
    callbackUrl: '/',
    redirect: false,
    ...credentials.value,
  })

  // If error is not null => Error is occurred
  if (response && response.error) {
    const apiStringifiedError = response.error
    const apiError ${isJS ? '' : ': NuxtError'}= JSON.parse(apiStringifiedError)
    errors.value = apiError.data ${isJS ? '' : 'as Record<string, string | undefined>'} 

    // If err => Don't execute further
    return
  }

  // Reset error on successful login
  errors.value = {}

  // Update user abilities
  const { user } = sessionData.value${!isJS ? '!' : ''}

  useCookie${!isJS ? '<Partial<User>>' : ''}('userData').value = user

  // Save user abilities in cookie so we can retrieve it back on refresh
  useCookie${!isJS ? '<User[\'abilityRules\']>' : ''}('userAbilityRules').value = user.abilityRules

  ability.update(user.abilityRules ?? [])

  navigateTo(route.query.to ? String(route.query.to) : '/', { replace: true })
}`,
        )
      },
    )

    // Update logout
    const logoutFilePath = path.join(this.projectPath, 'layouts', 'components', 'UserProfile.vue')
    updateFile(
      logoutFilePath,
      data => data.mustReplace(
        /const logout.*?\n}/gms,
        `const { signOut } = useAuth()

        async function logout() {
          try {
            await signOut({ redirect: false })

            // Remove "userData" from cookie
            userData.value = null

            // Reset user abilities
            ability.update([])
            
            navigateTo({ name: 'login' })
          }
          catch (error) {
            throw createError(error)
          }
        }`,
      ),
    )

    const masterServerApiRepoPath = getTemplatePath(this.templateConfig.templateName, 'nuxt-api')

    // Copy next-auth.d.ts
    fs.copyFileSync(
      path.join(masterServerApiRepoPath, 'next-auth.d.ts'),
      path.join(this.projectPath, 'next-auth.d.ts'),
    )

    // Merge .env & .env.example file
    const apiEnvFilePath = path.join(masterServerApiRepoPath, '.env')
    const envFilePath = path.join(this.projectPath, '.env')
    mergeEnvFiles(apiEnvFilePath, envFilePath)

    const apiEnvExampleFilePath = path.join(masterServerApiRepoPath, '.env.example')
    const envExampleFilePath = path.join(this.projectPath, '.env.example')
    mergeEnvFiles(apiEnvExampleFilePath, envExampleFilePath)

    // Update app/router.options.ts
    const routerOptionsPath = path.join(this.projectPath, 'app', `router.options.${lang}`)
    updateFile(routerOptionsPath, (data) => {
      return data.mustReplace(
        /middleware: to => {.*?},(?=.*?},.*?component)/gms,
        `middleware: to => {
          const { data: sessionData } = useAuth()

          const userRole = sessionData.value?.user.role

          if (userRole === 'admin')
            return { name: 'dashboards-crm' }
          if (userRole === 'client')
            return { name: 'access-control' }

          return { name: 'login', query: to.query }
        },`,
      )
    })
  }

  // TODO: We can convert this to utility function
  private moveToProjectsDir(isFree: boolean, isJS: boolean, isSK: boolean) {
    const replaceDest = (() => {
      const paths = this.templateConfig.nuxt.paths

      if (isFree)
        return isJS ? paths.freeJS : paths.freeTS
      else if (isJS)
        return isSK ? paths.JSStarter : paths.JSFull
      else
        return isSK ? paths.TSStarter : paths.TSFull
    })()

    // TODO: For free we might have to update the links.

    // Make sure dest dir exist. This is useful if we are generating laravel for first time.
    fs.ensureDirSync(replaceDest)

    // Place temp dir content in respected destination dir
    replaceDir(this.projectPath, replaceDest)
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

    await this.copyVueProjectFiles(sourcePath, isJS, lang, isSK)
    // execCmd('code --profile vue .', { cwd: this.projectPath })

    this.updatePkgJson(sourcePath)

    if (!isJS && !isFree && !isSK)
      this.removeEslintInternalRules(this.projectPath)

    // Update eslint config to use .nuxt tsconfig
    updateFile(
      path.join(this.projectPath, '.eslintrc.cjs'),
      data => data.mustReplace(
        isJS && !isFree ? 'typescript: { project: \'./jsconfig.json\' },' : 'typescript: {},',
        `typescript: {
        project: './.nuxt/tsconfig.json',
      },`,
      ),
    )

    // Remove src prefix from various files
    const filesToRemoveSrcPrefix = [
      path.join(this.projectPath, `vite.config.${lang}`),
      path.join(this.projectPath, 'package.json'),
      path.join(this.projectPath, langConfigFile),
      path.join(this.projectPath, '.eslintrc.cjs'),
      path.join(this.projectPath, '.gitignore'),
      path.join(this.projectPath, 'plugins', 'iconify', `build-icons.${lang}`),
      // path.join(this.projectPath, 'plugins', '1.router', `index.${lang}`),
    ]
    filesToRemoveSrcPrefix.forEach((filePath) => {
      updateFile(
        filePath,
        data => removePathPrefix(data, 'src'),
      )
    })

    // Update plugins to use defineNuxtPlugin
    this.updatePlugins(isSK, lang)

    // Update nuxt.config.ts
    await this.updateNuxtConfig(sourcePath, lang, langConfigFile, isSK, isFree)

    if (!(isSK || isFree))
      this.updateAdditionalRoutes(sourcePath, lang)

    if (isFree) {
      let freeConfigContent = `import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig> {
  routes: scannedRoutes => [
    ...scannedRoutes,
    {
      path: '/',
      name: 'index',
      redirect: '/dashboard',
    },
  ],
}`

      // Remove types from above snippet in JS version
      if (isJS) {
        freeConfigContent = freeConfigContent
          .mustReplace(/import type.*/gm, '')
          .mustReplace('<RouterConfig>', '')
      }

      const appDirPath = path.join(this.projectPath, 'app')
      fs.ensureDirSync(appDirPath)

      const routerOptionsFilePath = path.join(appDirPath, `router.options.${lang}`)
      writeFileSyncUTF8(routerOptionsFilePath, freeConfigContent)
    }

    if (isSK)
      // We don't want additional routes in SK
      await fs.remove(path.join(this.projectPath, 'app'))

    if (!(isSK || isFree))
      this.convertBeforeEachToMiddleware(sourcePath, lang)

    // Remove unwanted files
    await fs.remove(path.join(this.projectPath, `vite.config.${lang}`))

    // ℹ️ We've different dir name in free version
    await fs.remove(path.join(this.projectPath, 'plugins', isFree ? 'router' : '1.router'))

    // Rename definePage to definePageMeta.
    // There's no definePage in free pages to don't run it there
    if (!isFree)
      this.replaceDefinePageWithDefinePageMeta()

    this.update404Page(isJS)

    if (!(isSK || isFree))
      this.remove404PageNavLink(lang)

    this.updateLayouts(lang, isFree)

    if (!(isSK || isFree))
      this.copyServerApi(isJS)

    // Add `VueApexCharts` as client component due to SSR issues: https://github.com/apexcharts/vue-apexcharts/issues/307
    writeFileSyncUTF8(
      path.join(this.projectPath, 'components', 'VueApexCharts.client.vue'),
       `<script setup lang="ts">
// eslint-disable-next-line no-restricted-imports
import VueApexCharts from 'vue3-apexcharts'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <VueApexCharts v-bind="$attrs" />
</template>`,
    )

    if (!isFree)
      this.useNuxtFetch(isJS, lang)

    if (!(isSK || isFree))
      this.useAuthModule(isJS, lang)

    if (!isJS)
      await this.updateCustomRouteMeta(sourcePath)

    // Handle SSR issue with light/dark mode
    // updateFile(
    //   path.join(this.projectPath, 'plugins', 'vuetify', `theme.${lang}`),
    //   data => data.mustReplace(
    //     /defaultTheme: resolveVuetifyTheme\(\),/g,
    //     '// ❗ Don\'t define `defaultTheme` here. It will prevent switching to dark theme based on user preference due to SSR.',
    //   ),
    // )

    // handle SSR issue with VWindow and make it client only
    if (!(isSK || isFree)) {
      [
        path.join(this.projectPath, 'pages', 'pages', 'account-settings', '[tab].vue'),
        path.join(this.projectPath, 'pages', 'pages', 'user-profile', '[tab].vue'),
      ].forEach((filePath) => {
        updateFile(
          filePath,
          (data) => {
            if (!data.includes('ClientOnly')) {
              data = data.mustReplace(/<VWindow(?!Item)/gm, '<ClientOnly><VWindow')
              data = data.mustReplace('</VWindow>', '</VWindow></ClientOnly>')
              return data
            }
            return data
          })
      })

      // make swiper components client only
      globbySync('**/**/*.vue', { cwd: this.projectPath, absolute: true }).forEach((filePath) => {
        updateFile(
          filePath,
          (data) => {
            if (!data.includes('ClientOnly')) {
              data = data.replaceAll(/<swiper-container/gm, '<ClientOnly><swiper-container')
              data = data.replaceAll('</swiper-container>', '</swiper-container></ClientOnly>')
              return data
            }
            return data
          })
      })
    }

    // update menu navigation links
    if (isSK) {
      [
        path.join(this.projectPath, 'navigation', 'horizontal', `index.${lang}`),
        path.join(this.projectPath, 'navigation', 'vertical', `index.${lang}`),
      ].forEach((filePath) => {
        updateFile(
          filePath,
          data => data.mustReplace('root', 'index'))
      })
    }

    // ℹ️ We should run this in last to make replacement of router
    this.handleRouterChanges()

    // [Free] Define blank layout in certain files and add no-existence file
    if (this.isFree) {
      const pagesDir = path.join(this.projectPath, 'pages')
      const blankLayoutPages = [
        path.join(pagesDir, 'login.vue'),
        path.join(pagesDir, 'register.vue'),
      ]

      blankLayoutPages.forEach((filePath) => {
        updateFile(
          filePath,
          data => data.mustReplace(
            '</script>',
            `definePageMeta({ layout: 'blank' })
            </script>`,
          ),
        )
      })

      writeFileSyncUTF8(
        path.join(pagesDir, 'no-existence.vue'),
        `<script lang="ts" setup>
throw createError({
  statusCode: 404,
  statusMessage: 'Error Page! Just for demo!',
  fatal: true,
})
</script>

<template>
  <p>This is just demo page to avoid console error and show you error.</p>
</template>`,
      )
    }

    // Install additional packages
    const installPkgCmd = this.genInstallPkgsCmd(this.pkgsToInstall)
    execCmd(installPkgCmd, { cwd: this.projectPath })

    // Install all packages
    execCmd('pnpm install', { cwd: this.projectPath })

    // Run lint to fix linting errors
    execCmd('pnpm lint', { cwd: this.projectPath })

    // Remove ".nuxt" dir after installing packages. We don't want to ship this dir in package
    fs.removeSync(path.join(this.projectPath, '.nuxt'))

    this.moveToProjectsDir(isFree, isJS, isSK)
  }

  private genNuxtApiJs() {
    // Paths
    const templateServerApiRepoPath = getTemplatePath(this.templateConfig.templateName, 'nuxt-api')
    const templateServerApiJsRepoPath = getTemplatePath(this.templateConfig.templateName, 'nuxt-api-js')

    // Remove JS API if exist
    if (fs.existsSync(templateServerApiJsRepoPath))
      fs.removeSync(templateServerApiJsRepoPath)

    // Copy server dir
    fs.copySync(templateServerApiRepoPath, templateServerApiJsRepoPath)
    fs.removeSync(path.join(templateServerApiJsRepoPath, '.git'))

    // Remove node_modules amd pnpm-lock.yaml
    execCmd('rm -rf node_modules pnpm-lock.yaml', { cwd: templateServerApiJsRepoPath })

    // ℹ️ Handle special case where we don't have TS error but compiling using tsc give error
    const authFilePath = path.join(templateServerApiJsRepoPath, 'server', 'api', 'auth', '[...].ts')
    const authFileData = readFileSyncUTF8(authFilePath)
    updateFile(
      authFilePath,
      data => data.mustReplace(
        /(jwt: async|async session)/gm,
        `// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
         // @ts-ignore tsc cli gives error due to unknown reason even with correct types
        $1`,
      ),
    )

    // Install packages
    execCmd('pnpm install && pnpm tsc --noEmit false', { cwd: templateServerApiJsRepoPath })

    // Remove added comments from TS & compiled JS
    writeFileSyncUTF8(authFilePath, authFileData)
    updateFile(
      authFilePath.replace('.ts', '.js'),
      data => data
        .mustReplace('// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error', '')
        .mustReplace('// @ts-ignore tsc cli gives error.*', ''),
    )

    // Remove all TypeScript files
    globbySync(
      [
        '**/*.ts',
        '**/*.tsx',
        '**/*.d.ts',
        '**/*/types.js',
        '!node_modules',
      ],
      {
        cwd: templateServerApiJsRepoPath,
        absolute: true,
      },
    )
      .forEach(fs.removeSync)
  }

  async genPkg(hooks: GenPkgHooks, isInteractive = true, newPkgVersion?: string) {
    // eslint-disable-next-line prefer-template
    consola.box('🛠️ Generating Nuxt ' + (this.isFree && 'Free'))
    consola.box('🛠️ Do not forgot to create or take latest pull in  Nuxt API repo. ')

    // TS Full
    consola.start('Generating Nuxt TS Full')
    await this.genNuxt({ isFree: this.isFree })
    consola.success('Nuxt TS Full generated\n')

    // TS SK
    // ℹ️ We do not provide starters for free version
    if (!this.isFree) {
      consola.start('Generating Nuxt TS SK')
      await this.genNuxt({ isSK: true })
      consola.success('Nuxt TS SK generated\n')

      // Nuxt-API JS version for Js Only
      consola.start('Generating Nuxt JS API')
      this.genNuxtApiJs()
      consola.success('Nuxt JS API generated\n')
    }

    // JS Full
    consola.start('Generating Nuxt JS Full')
    await this.genNuxt({ isJS: true, isFree: this.isFree })
    consola.success('Nuxt JS Full generated\n')

    if (!this.isFree) {
      // Nuxt JS SK
      // ℹ️ We do not provide starters for free version
      consola.start('Generating Nuxt JS SK')
      await this.genNuxt({ isJS: true, isSK: true })
      consola.success('Nuxt JS SK generated\n')
    }

    consola.box('📦 Working on Nuxt Package')

    // Create new temp dir for storing pkg
    const { pkgJsonPaths, tempPkgTSSource, tempPkgDir } = this.isFree ? this.genFreePkg() : this.genProPkg()

    // update package name in package.json
    pkgJsonPaths.forEach((pkgJSONPath) => {
      updateJSONFileField(pkgJSONPath, 'name', this.templateConfig.nuxt.pkgName + (this.isFree ? '-free' : ''))
    })

    // package version for package name
    // ℹ️ If we run script non-interactively and don't pass package version, pkgVersionForZip will be null => we won't prepend version to package name
    let pkgVersionForZip: string | null = null

    if (isInteractive || newPkgVersion)
      pkgVersionForZip = await updatePkgJsonVersion(pkgJsonPaths, path.join(tempPkgTSSource, 'package.json'), newPkgVersion)

    if (!this.isFree) {
      const zipDirPath = this.isFree ? this.templateConfig.nuxt.paths.freeTS : this.templateConfig.nuxt.projectPath
      const zipPath = path.join(
        zipDirPath,
        `${this.templateConfig.nuxt.pkgName}${this.isFree ? '-free' : ''}${pkgVersionForZip ? `-v${pkgVersionForZip}` : ''}.zip`,
      )

      execCmd(`zip -rq ${zipPath} . -x "*.DS_Store" -x "*__MACOSX"`, { cwd: tempPkgDir })
      consola.success(`Package generated at: ${zipPath}`)
    }
    else {
      consola.success('Nuxt Free Generated 🎉')
    }
  }

  private insertDeployNuxtDemoGhAction() {
    // Update/Add GitHub action
    const ghWorkflowsDir = path.join(this.templateConfig.nuxt.projectPath, '.github', 'workflows')

    // Make sure workflow dir exist
    fs.ensureDirSync(ghWorkflowsDir)

    // get path of workflow file from base's data dir
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
    const baseDataDirPath = path.join(__dirname, 'data')

    const deployNuxtDemosWorkflowSourceFilePath = path.join(baseDataDirPath, this.isFree ? 'deploy-nuxt-free-demo.yml' : 'deploy-nuxt-demos.yml')
    const deployNuxtDemosWorkflowFilePath = path.join(ghWorkflowsDir, path.basename(deployNuxtDemosWorkflowSourceFilePath))

    // copy file from data to github workflow dir
    fs.copyFileSync(
      deployNuxtDemosWorkflowSourceFilePath,
      deployNuxtDemosWorkflowFilePath,
    )
  }

  private genProPkg() {
    this.insertDeployNuxtDemoGhAction()

    const tempPkgDir = new TempLocation().tempDir
    const tempPkgTS = path.join(tempPkgDir, 'typescript-version')
    const tempPkgJS = path.join(tempPkgDir, 'javascript-version')

    const tempPkgTSFull = path.join(tempPkgTS, 'full-version')
    const tempPkgTSStarter = path.join(tempPkgTS, 'starter-kit')

    // Create dirs
    fs.ensureDirSync(tempPkgTSFull)
    fs.ensureDirSync(tempPkgTSStarter)

    const tempPkgJSFull = path.join(tempPkgJS, 'full-version')
    const tempPkgJSStarter = path.join(tempPkgJS, 'starter-kit')

    // Create dirs
    fs.ensureDirSync(tempPkgJSFull)
    fs.ensureDirSync(tempPkgJSStarter)

    this.copyProject(this.templateConfig.nuxt.paths.TSFull, tempPkgTSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.nuxt.paths.TSStarter, tempPkgTSStarter, this.templateConfig.packageCopyIgnorePatterns)

    this.copyProject(this.templateConfig.nuxt.paths.JSFull, tempPkgJSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.nuxt.paths.JSStarter, tempPkgJSStarter, this.templateConfig.packageCopyIgnorePatterns)

    ;[tempPkgTSFull, tempPkgJSFull].forEach((projectPath) => {
      filterFileByLine(
        path.join(projectPath, 'App.vue'),
        line => !line.includes('BuyNow'),
      )
    })

    // Remove test pages from both full versions
    execCmd(`rm -rf ${path.join(tempPkgTSFull, 'pages', 'pages', 'test')}`)
    execCmd(`rm -rf ${path.join(tempPkgJSFull, 'pages', 'pages', 'test')}`)

    ;[tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].forEach((projectPath) => {
      fs.removeSync(path.join(projectPath, 'plugins', 'iconify', 'icons.css'))
      fs.removeSync(path.join(projectPath, '.env'))
    })

    // Copy documentation.html file from root of the repo
    fs.copyFileSync(
      path.join(this.templateConfig.projectPath, 'documentation.html'),
      path.join(tempPkgDir, 'documentation.html'),
    )

    // Remove caret and tilde from package.json
    ;[tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].forEach((projectPath) => {
      removeCaretTildeFromPackageJson(projectPath)
    })

    // package.json files paths in all four versions
    const pkgJsonPaths = [tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].map(p => path.join(p, 'package.json'))
    consola.info('TODO: We have this package.json path, Ensure version & name is getting updated:', pkgJsonPaths)
    return { pkgJsonPaths, tempPkgTSSource: tempPkgTSFull, tempPkgDir }
  }

  private genFreePkg() {
    const tempPkgDir = new TempLocation().tempDir
    const tempPkgTS = path.join(tempPkgDir, 'typescript-version')
    const tempPkgJS = path.join(tempPkgDir, 'javascript-version')

    // Create dirs
    fs.ensureDirSync(tempPkgTS)
    fs.ensureDirSync(tempPkgJS)

    // Copy from free version
    this.copyProject(this.templateConfig.nuxt.paths.freeTS, tempPkgTS, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.nuxt.paths.freeJS, tempPkgJS, this.templateConfig.packageCopyIgnorePatterns)

    ;[tempPkgTS, tempPkgJS].forEach((projectPath) => {
      filterFileByLine(
        path.join(projectPath, 'App.vue'),
        line => !line.includes('BuyNow'),
      )
    })

    // Remove test pages from both full versions
    execCmd(`rm -rf ${path.join(tempPkgTS, 'pages', 'pages', 'test')}`)
    execCmd(`rm -rf ${path.join(tempPkgJS, 'pages', 'pages', 'test')}`)

    ;[tempPkgTS, tempPkgJS].forEach((projectPath) => {
      fs.removeSync(path.join(projectPath, 'plugins', 'iconify', 'icons.css'))
      fs.removeSync(path.join(projectPath, '.env'))
    })

    // Copy documentation.html file from root of the repo
    fs.copyFileSync(
      path.join(this.templateConfig.projectPath, 'documentation.html'),
      path.join(tempPkgDir, 'documentation.html'),
    )

    // package.json files paths in all four versions
    const pkgJsonPaths = [this.templateConfig.nuxt.paths.freeTS, this.templateConfig.nuxt.paths.freeJS].map(p => path.join(p, 'package.json'))
    return { pkgJsonPaths, tempPkgTSSource: tempPkgTS, tempPkgDir }
  }
}
