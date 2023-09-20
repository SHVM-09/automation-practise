import path from 'node:path'
import * as url from 'node:url'

import type { TemplateBaseConfig } from '@/templates/base'
import { themeselection as themeselectionGTMConfig } from '@/templates/base/gtmConfig'
import '@/utils/injectMustReplace'
import { getTemplatePath } from '@/utils/paths'

export type MasterConfig = TemplateBaseConfig & { paths: { freeInternalTs: string } }

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const masterVuePath = path.join(getTemplatePath('master', 'vue'))
const masterVueLaravelPath = path.join(getTemplatePath('master', 'vue-laravel'))
const masterVueFreePath = masterVuePath.mustReplace('vue', 'vue-free')
const masterVueFreeInternalPath = masterVuePath.mustReplace('vue', 'vue-free-internal')
const masterVueLaravelFreePath = masterVuePath.mustReplace('vue', 'vue-laravel-free')

export const config: MasterConfig = {
  templateName: 'master',
  templateDomain: 'ts',
  projectPath: masterVuePath,
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
    '!icons/payments',
    '!iconify-svg',
    '!customizer-icons',
  ],
  paths: {
    tSFull: path.join(masterVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(masterVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(masterVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(masterVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
    freeInternalTs: path.join(masterVueFreeInternalPath, 'typescript-version'),
    freeTS: path.join(masterVueFreePath, 'typescript-version'),
    freeJS: path.join(masterVueFreePath, 'javascript-version'),
    docs: path.join(masterVuePath, 'docs'),
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
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/master-vuetify-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Master - Vuetify Vuejs Admin Template',
    docUrl: 'https://demos.themeselection.com/master-vuetify-vuejs-admin-template/documentation/',
  },
  changelog: {
    pageTitle: 'Master - Vuetify Vuejs Admin Template',
    url: 'https://demos.themeselection.com/master-vuetify-vuejs-admin-template/changelog.html',
  },
  gh: {
    ownerName: 'themeselection',
    repoName: 'master-vue--material',
  },
  gtm: themeselectionGTMConfig,
  nuxt: {
    pkgName: 'master-nuxtjs-admin-template',
  },
  laravel: {
    pkgName: 'master-vuetify-vuejs-laravel-admin-template',
    buyNowLink: 'https://themeselection.com/item/master-vuetify-vuejs-admin-template/',
    projectPath: masterVueLaravelPath,
    paths: {
      TSFull: path.join(masterVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(masterVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(masterVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(masterVueLaravelPath, 'javascript-version', 'starter-kit'),
      freeJS: path.join(masterVueLaravelFreePath, 'javascript-version'),
      freeTS: path.join(masterVueLaravelFreePath, 'typescript-version'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/master-vuetify-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
    documentation: {
      pageTitle: 'Master - Vuetify Vuejs Laravel Admin Template',
      docUrl: 'https://demos.themeselection.com/master-vuetify-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    },
    changelog: {
      pageTitle: 'Master - Vuetify Vuejs Laravel Admin Template',
      url: 'https://demos.themeselection.com/master-vuetify-vuejs-admin-template/documentation/guide/laravel-integration/changelog.html',
    },
  },
}
