import '@/utils/injectMustReplace'
import path from 'node:path'
import { consola } from 'consola'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { updateFileAsync } from '@/utils/node'

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

  private async updateNuxtConfigForVercelIssues() {
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
    })
  }

  // private async updateGetPublicPathUtil() {
  //   const getPublicPathUtilPath = path.join(this.templateConfig.nuxt.paths.TSFull, 'server', 'utils', 'getPublicUrl.ts')

  //   await updateFileAsync(getPublicPathUtilPath, (content) => {
  //     return content.mustReplace(
  //       /(getPublicUrl.*)/gm,
  //       '$1\nreturn path',
  //     )
  //   })
  // }

  async prepareForBuild() {
    await Promise.all([
      this.createDemosPlugin(),
      this.updateCustomizer(),
      this.updateCoreStore(),
      this.updateCookieName(),
      this.updateLayoutsPlugin(),
      this.updateNuxtConfigForVercelIssues(),
      // this.updateGetPublicPathUtil(),
    ])
    consola.success('Repo is updated for demos. You can now runt the build command.')
  }
}
