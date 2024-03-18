import '@/utils/injectMustReplace'
import path from 'node:path'
import { consola } from 'consola'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { execCmd, updateFile, updateFileAsync } from '@/utils/node'

export class GenDemo {
  constructor(private templateConfig: TemplateBaseConfig) { }

  private async createDemosPlugin() {
    const demosPluginPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'plugins', 'demos.ts')
    await fs.writeFile(
      demosPluginPath,
      `export default defineNuxtPlugin(nuxtApp => {
  const demoHeader = useRequestHeader('X-server-header')
  const appConfig = useAppConfig()

  // Set demo name in appConfig
  if (import.meta.server)
    nuxtApp.payload.demo = demoHeader
  else
    appConfig.demo = nuxtApp.payload.demo

  // Set demoConfig in appConfig
  let demoConfig: Record<string, any> | null = null

  nuxtApp.vueApp.runWithContext(() => {
    // const configStore = useConfigStore()

    if (demoHeader === 'demo-1') {
      demoConfig = {
        theme: 'light',
      }
    }
    else if (demoHeader === 'demo-2') {
      demoConfig = {
        theme: 'light',
        skin: 'bordered',
      }
    }
    else if (demoHeader === 'demo-3') {
      demoConfig = {
        theme: 'light',
        isVerticalNavSemiDark: true,
      }
    }
    else if (demoHeader === 'demo-4') {
      demoConfig = {
        theme: 'dark',
      }
    }
    else if (demoHeader === 'demo-5') {
      demoConfig = {
        appContentLayoutNav: 'horizontal',
        theme: 'light',
      }
    }
    else if (demoHeader === 'demo-6') {
      demoConfig = {
        appContentLayoutNav: 'horizontal',
        theme: 'dark',
      }
    }
  })

  if (import.meta.server) {
    nuxtApp.payload.demoConfig = demoConfig
    appConfig.demoConfig = demoConfig
  }
  else { appConfig.demoConfig = nuxtApp.payload.demoConfig }
})`,
      { encoding: 'utf-8' },
    )
  }

  private async updateCustomizer() {
    const customizerPath = path.join(this.templateConfig.nuxt.paths.TSFull, '@core', 'components', 'TheCustomizer.vue')

    await updateFileAsync(customizerPath, (content) => {
      // ❗ Order matters here. We are first replacing existing values to vars we'll add later
      return content
        .mustReplace('themeConfig.app.theme', 'demoTheme')
        .mustReplace('themeConfig.app.skin', 'demoSkin')
        .mustReplace('themeConfig.verticalNav.isVerticalNavSemiDark', 'demoIsVerticalNavSemiDark')
        .mustReplace('themeConfig.app.contentLayoutNav', 'demoAppContentLayoutNav')
        .mustReplace(
          /^(?<=import.*\n*)(?=const)/gm,
        `const nuxtApp = useNuxtApp()
const appConfig = useAppConfig()

const demoTheme = nuxtApp.payload.demoConfig?.theme ?? appConfig.demoConfig?.theme ?? themeConfig.app.theme
const demoSkin = nuxtApp.payload.demoConfig?.skin ?? appConfig.demoConfig?.skin ?? themeConfig.app.skin
const demoIsVerticalNavSemiDark = nuxtApp.payload.demoConfig?.isVerticalNavSemiDark ?? appConfig.demoConfig?.isVerticalNavSemiDark ?? themeConfig.verticalNav.isVerticalNavSemiDark
const demoAppContentLayoutNav = nuxtApp.payload.demoConfig?.appContentLayoutNav ?? appConfig.demoConfig?.appContentLayoutNav ?? themeConfig.app.contentLayoutNav
`,
        )
    })
  }

  private async updateCoreStore() {
    const coreStorePath = path.join(this.templateConfig.nuxt.paths.TSFull, '@core', 'stores', 'config.ts')

    await updateFileAsync(coreStorePath, (content) => {
      // ❗ Order matters here. We are first replacing existing values to vars we'll add later
      return content
        .mustReplace(
          'themeConfig.app.theme',
          'nuxtApp.payload.demoConfig?.theme ?? appConfig.demoConfig?.theme ?? themeConfig.app.theme',
        )
        .mustReplace(
          'themeConfig.verticalNav.isVerticalNavSemiDark',
          'nuxtApp.payload.demoConfig?.isVerticalNavSemiDark ?? appConfig.demoConfig?.isVerticalNavSemiDark ?? themeConfig.verticalNav.isVerticalNavSemiDark',
        )
        .mustReplace(
          'themeConfig.app.skin',
          'nuxtApp.payload.demoConfig?.skin ?? appConfig.demoConfig?.skin ?? themeConfig.app.skin',
        ).mustReplace(
          /(?<=defineStore.*)\n/gm,
        `
  const nuxtApp = useNuxtApp()
  const appConfig = useAppConfig()
`,
        )
    })
  }

  private async updateCookieName() {
    const layoutStorePath = path.join(this.templateConfig.nuxt.paths.TSFull, '@layouts', 'stores', 'config.ts')

    await updateFileAsync(layoutStorePath, (content) => {
      return content.mustReplace(
        /\`\${layoutConfig.app.title}-\${str}\`/g,
        `{
  const nuxtApp = useNuxtApp()
  const appConfig = useAppConfig()

  // Try to get demo from: header (server) -> nuxt payload (hydration) -> appConfig (client)
  const demo = useRequestHeader('X-server-header') ?? nuxtApp.payload.demo ?? appConfig.demo

  let namespace = \`\${layoutConfig.app.title}-\${str}\`

  if (demo)
    namespace += \`-\${demo}\`

  return namespace
}`,
      )
    })
  }

  private async updateLayoutsPlugin() {
    const layoutsPluginPath = path.join(this.templateConfig.nuxt.paths.TSFull, '@layouts', 'index.ts')

    await updateFileAsync(layoutsPluginPath, (content) => {
      return content
        .mustReplace(
          /(?<='appContentLayoutNav',)/gm,
          ' nuxtApp.payload.demoConfig?.appContentLayoutNav ?? appConfig.demoConfig?.appContentLayoutNav ??',
        ).mustReplace(
          /(?<=return \(\): void => {\n)/gm,
        `
    const nuxtApp = useNuxtApp()
    const appConfig = useAppConfig()
`,
        )
    })
  }

  private async updateNuxtConfig() {
    const nuxtConfigPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'nuxt.config.ts')

    await updateFileAsync(nuxtConfigPath, (content) => {
      return content
        .mustReplace(
          /(?<=export default defineNuxtConfig\({)/gm,
          `
  $production: {
    app: {
      buildAssetsDir: \`\${process.env.NUXT_APP_BASE_URL}/_nuxt/\`,
    },
    nitro: {
      runtimeConfig: {
        app: {
          buildAssetsDir: '_nuxt',
        },
      },
    },
  },`,
        )
        // Ensure demo plugin initializes first
        .mustReplace(
          /(?<=plugins: \[\n)(?=\s+')/gm,
          '\'@/plugins/demos.ts\',',
        )
    })
  }

  private async updateGetPublicPathUtil() {
    const getPublicPathUtilPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'server', 'utils', 'getPublicUrl.ts')

    await updateFileAsync(getPublicPathUtilPath, (content) => {
      return content.mustReplace(
        /(getPublicUrl.*)/gm,
        '$1\nreturn path',
      )
    })
  }

  private async updateVuetifyPlugin() {
    const vuetifyPluginPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'plugins', 'vuetify', 'index.ts')

    await updateFileAsync(vuetifyPluginPath, (content) => {
      return content.mustReplace(
        /resolveVuetifyTheme\(.*\)/g,
        'resolveVuetifyTheme(import.meta.server ? nuxtApp.payload.demoConfig?.theme : useAppConfig().demoConfig?.theme)',
      )
    })
  }

  private async handleCORS() {
    const serverMiddlewareDirPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'server', 'middleware')

    fs.ensureDirSync(serverMiddlewareDirPath)

    const addCorsMiddleware = fs.writeFile(
      path.join(serverMiddlewareDirPath, 'cors.ts'),
      `// Thanks: https://github.com/nuxt/nuxt/issues/14598#issuecomment-1872279920
export default defineEventHandler((event) => {
  // Answers HTTP 204 OK to CORS preflight requests using OPTIONS method :
  // if (event.method === 'OPTIONS' && isPreflightRequest(event)) {
  if (isPreflightRequest(event)) {
    event.node.res.statusCode = 204
    event.node.res.statusMessage = 'No Content'
    return 'OK'
  }
})`,
    )

    const nuxtConfigPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'nuxt.config.ts')
    const updateNuxtConfig = updateFileAsync(nuxtConfigPath, (content) => {
      return content.mustReplace(
        /(?=^}\))/gm,
        `
  routeRules: {
    '/api/**': {
      // enable CORS
      cors: true, // if enabled, also needs cors-preflight-request.ts Nitro middleware to answer CORS preflight requests
      headers: {
        // CORS headers
        'Access-Control-Allow-Origin': 'https://demos.themeselection.com', // 'http://example:6006', has to be set to the requesting domain that you want to send the credentials back to
        'Access-Control-Allow-Methods': '*', // 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': '*', // 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
        'Access-Control-Expose-Headers': '*',
        // 'Access-Control-Max-Age': '7200', // 7200 = caching 2 hours (Chromium default), https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age#directives
      },
    },
  },
`,
      )
    })

    await Promise.all([
      updateNuxtConfig,
      addCorsMiddleware,
    ])
  }

  private async blockModifierAPICalls() {
    const findOutput = execCmd('grep --include=*.vue --include=*.ts --exclude-dir=node_modules -Rnw . -e "\\$api\(" | cut -d ":" -f 1', { encoding: 'utf-8', cwd: this.templateConfig.nuxt.paths.TSFull })

    const files = findOutput?.split('\n').filter(Boolean)

    await Promise.all(
      files?.map(async (filePath) => {
        await updateFileAsync(
          path.join(this.templateConfig.nuxt.paths.TSFull, filePath),
          (content) => {
            // Get all matches that has $api usage
            const matches = content.match(/.*\$api\((.*\)|(.|\n)*?}\))/g)
            let newContent = content

            matches?.forEach((match) => {
              // If match includes method, we'll add return; before it
              // We assume GET methods won't have "method:" and hence we'll allow making GET requests
              if (match.includes('method:'))
                newContent = newContent.replace(match, `return; \n${match}`)
            })

            return newContent
          },
        )
      }),
    )
  }

  async prepareForBuild() {
    await Promise.all([
      this.createDemosPlugin(),
      this.updateCustomizer(),
      this.updateCoreStore(),
      this.updateCookieName(),
      this.updateLayoutsPlugin(),
      this.updateVuetifyPlugin(),
      this.updateNuxtConfig(),
      this.blockModifierAPICalls(),

      // ❗ We have set rewrite in nginx so we don't need this. Even with this, We can't load images properly.
      // this.updateGetPublicPathUtil(),
    ])

    // ❗ We placed this outside of Promise.all because there's already one function updating nuxt config so we need to wait for it.
    // ℹ️ In future, to avoid above we can create queue of functions and run them one by one for single file.
    await this.handleCORS()
    consola.success('Repo is updated for demos. You can now run the build command.')
  }

  injectGTMInNuxtConfig(isFree = false) {
    const projectRoot = isFree ? this.templateConfig.nuxt.paths.freeTS : this.templateConfig.nuxt.paths.TSFull
    const nuxtConfigPath = path.join(projectRoot, 'nuxt.config.ts')

    const extractGTMTagContent = (str: string): string => {
      const match = str.match(/<\w+>(.*)<\/\w+>/s)

      if (match)
        return match[1]
      else
        throw consola.error('Failed to extract tag content')
    }

    updateFile(nuxtConfigPath, (content) => {
      return content.mustReplace(
        /(?<=head: {)/g,
        `
script: [{ children: \`${extractGTMTagContent(this.templateConfig.gtm.headScript)}\` }],
noscript: [{ children: \`${extractGTMTagContent(this.templateConfig.gtm.bodyNoScript)}\` }],
        `,
      )
    })
  }
}
