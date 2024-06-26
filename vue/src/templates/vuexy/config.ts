import path from 'node:path'
import * as url from 'node:url'

import type { TemplateBaseConfig } from '@/templates/base'
import { pixinvent as pixinventGTMConfig } from '@/templates/base/gtmConfig'
import '@/utils/injectMustReplace'
import { getTemplatePath } from '@/utils/paths'

export type VuexyConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const vuexyVuePath = path.join(getTemplatePath('vuexy', 'vue'))
const vuexyVueLaravelPath = path.join(getTemplatePath('vuexy', 'vue-laravel'))
const vuexyVueFreePath = vuexyVuePath.mustReplace(/\bvue\b/g, 'vue-free')
const vuexyVueLaravelFreePath = vuexyVuePath.mustReplace(/\bvue\b/g, 'vue-laravel-free')
const vuexyNuxtPath = path.join(getTemplatePath('vuexy', 'nuxt'))
const vuexyNuxtFreePath = path.join(getTemplatePath('nuxt', 'nuxt-free'))

export const config: VuexyConfig = {
  templateName: 'vuexy',
  templateDomain: 'pi',
  projectPath: vuexyVuePath,
  ignoreCompressionPatterns: [
    '**/auth-v2-register-illustration-light.*',
    '**/auth-v2-register-illustration-bordered-light.*',
    '**/hero-dashboard-light.*',
    '**/front-pages/**/Background.*',
    '**/front-pages/**/hero-bg.*',
    '**/front-pages/**/cta-bg.*',
    '**/front-pages/**/hero-dashboard-dark.*',
    '**/front-pages/**/hero-dashboard-light.*',
    '**/front-pages/**/hero-elements-dark.*',
    '**/front-pages/**/hero-elements-light.*',
    '**/front-pages/**/product-image.*',
  ],
  packageCopyIgnorePatterns: [
    // Directories
    'dist',
    'docs',
    'scripts',
    '.git',
    '.github',
    'node_modules',

    // Files
    'LICENSE.md',
    'license.md',
    '*.log',
    '*.zip',

    // Laravel only
    'vendor',
  ],
  sKImagesRemovePatterns: [
    '**/*',
    '!logo.svg',
    '!cards',
    '!svg',
    '!iconify-svg',
    '!pages',
    '!avatars',
    '!illustrations',
    '!misc',
    '!icons/payments',
    '!customizer-icons',
  ],
  paths: {
    tSFull: path.join(vuexyVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(vuexyVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(vuexyVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(vuexyVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
    freeTS: path.join(vuexyVueFreePath, 'typescript-version'),
    freeJS: path.join(vuexyVueFreePath, 'javascript-version'),
    docs: path.join(vuexyVuePath, 'docs'),
  },
  demosConfig: [
    // Demo 1
    [
      {
        find: 'theme: \'system\'',
        replace: 'theme: \'light\'',
      },
    ],

    // Demo 2
    [
      {
        find: 'theme: \'system\'',
        replace: 'theme: \'light\'',
      },
      {
        find: 'skin: Skins.Default',
        replace: 'skin: Skins.Bordered',
      },
    ],

    // Demo 3
    [
      {
        find: 'theme: \'system\'',
        replace: 'theme: \'light\'',
      },
      {
        find: 'isVerticalNavSemiDark: false',
        replace: 'isVerticalNavSemiDark: true',
      },
    ],

    // Demo 4
    [
      {
        find: 'theme: \'system\'',
        replace: 'theme: \'dark\'',
      },
    ],

    // Demo 5
    [
      {
        find: 'theme: \'system\'',
        replace: 'theme: \'light\'',
      },
      {
        find: 'contentLayoutNav: AppContentLayoutNav.Vertical',
        replace: 'contentLayoutNav: AppContentLayoutNav.Horizontal',
      },
    ],

    // Demo 6
    [
      {
        find: 'contentLayoutNav: AppContentLayoutNav.Vertical',
        replace: 'contentLayoutNav: AppContentLayoutNav.Horizontal',
      },
      {
        find: 'theme: \'system\'',
        replace: 'theme: \'dark\'',
      },
    ],
  ],
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/vuexy-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Vuexy - Vuejs Admin Template',
    docUrl: 'https://demos.pixinvent.com/vuexy-vuejs-admin-template/documentation/',
  },
  changelog: {
    pageTitle: 'Vuexy - Vuejs Admin Template Changelog',
    url: 'https://demos.pixinvent.com/vuexy-vuejs-admin-template/changelog.html',
  },
  gh: {
    ownerName: 'pixinvent',
    repoName: 'vuexy-vuejs-admin-template',
    branch: 'dev',
  },
  gtm: pixinventGTMConfig,
  nuxt: {
    pkgName: 'vuexy-nuxtjs-admin-template',
    buyNowLink: 'https://1.envato.market/vuexy_admin',
    projectPath: vuexyNuxtPath,
    paths: {
      TSFull: path.join(vuexyNuxtPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(vuexyNuxtPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(vuexyNuxtPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(vuexyNuxtPath, 'javascript-version', 'starter-kit'),
      freeJS: path.join(vuexyNuxtFreePath, 'javascript-version'),
      freeTS: path.join(vuexyNuxtFreePath, 'typescript-version'),
    },
  },
  laravel: {
    pkgName: 'vuexy-vuejs-laravel-admin-template',
    buyNowLink: 'https://1.envato.market/vuexy_admin',
    projectPath: vuexyVueLaravelPath,
    paths: {
      TSFull: path.join(vuexyVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(vuexyVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(vuexyVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(vuexyVueLaravelPath, 'javascript-version', 'starter-kit'),
      freeJS: path.join(vuexyVueLaravelFreePath, 'javascript-version'),
      freeTS: path.join(vuexyVueLaravelFreePath, 'typescript-version'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean, isFree: boolean) => `/vuexy-vuejs-laravel-admin-template${isFree ? '-free' : ''}${isStaging ? '/staging' : ''}/${isFree ? 'demo' : `demo-${demoNumber}`}/`,
    documentation: {
      pageTitle: 'Vuexy - Vuejs Laravel Admin Template',
      docUrl: 'https://demos.pixinvent.com/vuexy-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    },
    changelog: {
      pageTitle: 'Vuexy - Vuejs Laravel Admin Template Changelog',
      url: 'https://demos.pixinvent.com/vuexy-vuejs-laravel-admin-template/changelog.html',
    },
  },
}
