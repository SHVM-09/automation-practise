import path from 'path'
import * as url from 'url'

import type { TemplateBaseConfig } from '@/templates/base'
import { pixinvent as pixinventGTMConfig } from '@/templates/base/gtmConfig'
import '@/utils/injectMustReplace'
import { getTemplatePath } from '@/utils/paths'

type VuexyConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const vuexyVuePath = path.join(getTemplatePath('vuexy', 'vue'))
const vuexyVueLaravelPath = path.join(getTemplatePath('vuexy', 'vue-laravel'))
const vuexyVueFreePath = vuexyVuePath.mustReplace('vue', 'vue-free')

export const config: VuexyConfig = {
  templateName: 'Vuexy',
  templateDomain: 'pi',
  projectPath: vuexyVuePath,
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
    '!iconify-svg',
    '!pages',
    '!avatars',
    '!misc',
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
    null,

    // Demo 2
    [
      {
        find: 'skin: Skins.Default',
        replace: 'skin: Skins.Bordered',
      },
    ],

    // Demo 3
    [
      {
        find: 'isVerticalNavSemiDark: false',
        replace: 'isVerticalNavSemiDark: true',
      },
    ],

    // Demo 4
    [
      {
        find: 'theme: \'light\'',
        replace: 'theme: \'dark\'',
      },
    ],

    // Demo 5
    [
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
        find: 'theme: \'light\'',
        replace: 'theme: \'dark\'',
      },
    ],
  ],
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/demo/vuexy-vuejs-admin-dashboard-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Vuexy - Vuetify Vuejs Admin Template',
    docUrl: 'https://pixinvent.com/demo/vuexy-vuejs-admin-dashboard-template/documentation/',
  },
  gh: {
    ownerName: 'pixinvent',
    repoName: 'vuexy-vuejs-admin-template',
    branch: 'dev',
  },
  gtm: pixinventGTMConfig,
  laravel: {
    pkgName: 'vuexy-vuejs-laravel-admin-template',
    projectPath: vuexyVueLaravelPath,
    paths: {
      TSFull: path.join(vuexyVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(vuexyVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(vuexyVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(vuexyVueLaravelPath, 'javascript-version', 'starter-kit'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/demo/vuexy-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
    documentation: {
      pageTitle: 'Vuexy - Vuetify Vuejs Laravel Admin Template',
      docUrl: 'https://pixinvent.com/demo/vuexy-vuejs-admin-dashboard-template/documentation/guide/laravel-integration/folder-structure.html',
    },
    demoPathOnServer: (demoNumber, isStaging) => `/demo/vuexy-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}`,
  },
}
