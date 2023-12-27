import path from 'node:path'
import * as url from 'node:url'

import type { TemplateBaseConfig } from '@/templates/base'
import { themeselection as themeselectionGTMConfig } from '@/templates/base/gtmConfig'
import '@/utils/injectMustReplace'
import { getTemplatePath } from '@/utils/paths'

export type MaterioConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const materioVuePath = path.join(getTemplatePath('materio', 'vue'))
const materioVueLaravelPath = path.join(getTemplatePath('materio', 'vue-laravel'))
const materioVueFreePath = materioVuePath.mustReplace('vue', 'vue-free')
const materioVueLaravelFreePath = materioVuePath.mustReplace('vue', 'vue-laravel-free')

const materioNuxtPath = path.join(getTemplatePath('materio', 'nuxt'))
const materioNuxtFreePath = materioNuxtPath.mustReplace('nuxt', 'nuxt-free')

export const config: MaterioConfig = {
  templateName: 'materio',
  templateDomain: 'ts',
  projectPath: materioVuePath,
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
    '!svg',
    '!pages',
    '!avatars',
    '!misc',
    '!customizer-icons',
    '!icons/payments',
    '!icons/brands',
  ],
  ignoreCompressionPatterns: [
    '**/hero-*',
    '**/front-pages/**/product-image.*'
  ],
  paths: {
    tSFull: path.join(materioVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(materioVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(materioVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(materioVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
    freeTS: path.join(materioVueFreePath, 'typescript-version'),
    freeJS: path.join(materioVueFreePath, 'javascript-version'),
    docs: path.join(materioVuePath, 'docs'),
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
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/materio-vuetify-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Materio - Vuetify Vuejs Admin Template',
    docUrl: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/',
  },
  changelog: {
    pageTitle: 'Materio - Vuetify Vuejs Admin Template Changelog',
    url: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/changelog.html',
  },
  gh: {
    ownerName: 'themeselection',
    repoName: 'materio-vuetify-vuejs-admin-template',
    branch: 'dev',
  },
  gtm: themeselectionGTMConfig,
  nuxt: {
    pkgName: 'materio-nuxtjs-admin-template',
    buyNowLink: 'https://themeselection.com/item/materio-vuetify-nuxtjs-admin-template/',
    projectPath: materioNuxtPath,
    paths: {
      TSFull: path.join(materioNuxtPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(materioNuxtPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(materioNuxtPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(materioNuxtPath, 'javascript-version', 'starter-kit'),
      freeJS: path.join(materioNuxtFreePath, 'javascript-version'),
      freeTS: path.join(materioNuxtFreePath, 'typescript-version'),
    },
  },
  laravel: {
    pkgName: 'materio-vuetify-vuejs-laravel-admin-template',
    buyNowLink: 'https://themeselection.com/item/materio-vuetify-vuejs-laravel-admin-template/',
    projectPath: materioVueLaravelPath,
    paths: {
      TSFull: path.join(materioVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(materioVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(materioVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(materioVueLaravelPath, 'javascript-version', 'starter-kit'),
      freeJS: path.join(materioVueLaravelFreePath, 'javascript-version'),
      freeTS: path.join(materioVueLaravelFreePath, 'typescript-version'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/materio-vuetify-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
    documentation: {
      pageTitle: 'Materio - Vuetify Vuejs Laravel Admin Template',
      docUrl: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    },
    changelog: {
      pageTitle: 'Materio - Vuetify Vuejs Laravel Admin Template Changelog',
      url: 'https://demos.themeselection.com/materio-vuetify-vuejs-laravel-admin-template/changelog.html',
    },
  },
}
