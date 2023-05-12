import path from 'path'
import * as url from 'url'
import type { TemplateBaseConfig } from '@/templates/base'
import { themeselection as themeselectionGTMConfig } from '@/templates/base/gtmConfig'
import { getTemplatePath } from '@/utils/paths'

type MasterConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const masterVuePath = path.join(getTemplatePath('master', 'vue'))
const masterVueLaravelPath = path.join(getTemplatePath('master', 'vue-laravel'))

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
  ],
  sKImagesRemovePatterns: [
    '**/*',
    '!logo.svg',
    '!svg',
    '!pages',
    '!avatars',
    '!misc',
    '!iconify-svg',
  ],
  paths: {
    tSFull: path.join(masterVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(masterVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(masterVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(masterVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
    freeTS: '/tmp',
    freeJS: '/tmp',
    docs: path.join(masterVuePath, 'docs'),
  },
  demosConfig: [
    // Demo 1
    null,

    // // Demo 2
    // [
    //   {
    //     find: 'skin: Skins.Default',
    //     replace: 'skin: Skins.Bordered',
    //   },
    // ],

    // // Demo 3
    // [
    //   {
    //     find: 'isVerticalNavSemiDark: false',
    //     replace: 'isVerticalNavSemiDark: true',
    //   },
    // ],

    // // Demo 4
    // [
    //   {
    //     find: 'theme: \'light\'',
    //     replace: 'theme: \'dark\'',
    //   },
    // ],

    // // Demo 5
    // [
    //   {
    //     find: 'contentLayoutNav: AppContentLayoutNav.Vertical',
    //     replace: 'contentLayoutNav: AppContentLayoutNav.Horizontal',
    //   },
    // ],

    // // Demo 6
    // [
    //   {
    //     find: 'contentLayoutNav: AppContentLayoutNav.Vertical',
    //     replace: 'contentLayoutNav: AppContentLayoutNav.Horizontal',
    //   },
    //   {
    //     find: 'theme: \'light\'',
    //     replace: 'theme: \'dark\'',
    //   },
    // ],
  ],
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/master-vuetify-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Master - Vuetify Vuejs Admin Template',
    docUrl: 'https://demos.themeselection.com/master-vuetify-vuejs-admin-template/documentation/',
  },
  gh: {
    ownerName: 'themeselection',
    repoName: 'master-vue--material',
  },
  gtm: themeselectionGTMConfig,
  laravel: {
    pkgName: 'master-vuetify-vuejs-laravel-admin-template',
    buyNowLink: 'https://themeselection.com/item/master-vuetify-vuejs-admin-template/',
    projectPath: masterVueLaravelPath,
    paths: {
      TSFull: path.join(masterVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(masterVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(masterVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(masterVueLaravelPath, 'javascript-version', 'starter-kit'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/master-vuetify-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
    documentation: {
      pageTitle: 'Master - Vuetify Vuejs Laravel Admin Template',
      docUrl: 'https://demos.themeselection.com/master-vuetify-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    },
  },
}
