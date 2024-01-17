import path from 'node:path'
import * as url from 'node:url'

import type { TemplateBaseConfig } from '@/templates/base'
import { themeselection as themeselectionGTMConfig } from '@/templates/base/gtmConfig'
import '@/utils/injectMustReplace'
import { getTemplatePath } from '@/utils/paths'

export type SneatConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const sneatVuePath = path.join(getTemplatePath('sneat', 'vue'))
const sneatVueLaravelPath = path.join(getTemplatePath('sneat', 'vue-laravel'))
const sneatVueFreePath = sneatVuePath.mustReplace(/\bvue\b/g, 'vue-free')
const sneatVueLaravelFreePath = sneatVuePath.mustReplace(/\bvue\b/g, 'vue-laravel-free')

export const config: SneatConfig = {
  templateName: 'sneat',
  templateDomain: 'ts',
  projectPath: sneatVuePath,
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
    '!illustrations',
    '!iconify-svg',
  ],
  paths: {
    tSFull: path.join(sneatVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(sneatVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(sneatVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(sneatVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
    freeTS: path.join(sneatVueFreePath, 'typescript-version'),
    freeJS: path.join(sneatVueFreePath, 'javascript-version'),
    docs: path.join(sneatVuePath, 'docs'),
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
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/sneat-vuetify-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Sneat - Vuetify Vuejs Admin Template',
    docUrl: 'https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/documentation/',
  },
  changelog: {
    pageTitle: 'Sneat - Vuetify Vuejs Admin Template Changelog',
    url: 'https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/changelog.html',
  },
  gh: {
    ownerName: 'themeselection',
    repoName: 'sneat-vuetify-vuejs-admin-template',
    branch: 'main',
  },
  gtm: themeselectionGTMConfig,
  laravel: {
    pkgName: 'sneat-vuetify-vuejs-laravel-admin-template',
    buyNowLink: 'https://themeselection.com/item/sneat-vuetify-vuejs-laravel-admin-template',
    projectPath: sneatVueLaravelPath,
    paths: {
      TSFull: path.join(sneatVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(sneatVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(sneatVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(sneatVueLaravelPath, 'javascript-version', 'starter-kit'),
      freeTS: path.join(sneatVueLaravelFreePath, 'typescript-version'),
      freeJS: path.join(sneatVueLaravelFreePath, 'javascript-version'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean, isFree: boolean) => `/sneat-vuetify-vuejs-laravel-admin-template${isFree ? '-free' : ''}${isStaging ? '/staging' : ''}/${isFree ? 'demo' : `demo-${demoNumber}`}/`,
    documentation: {
      pageTitle: 'Sneat - Vuetify Vuejs Laravel Admin Template',
      docUrl: 'https://demos.themeselection.com/sneat-vuetify-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    },
    changelog: {
      pageTitle: 'Sneat - Vuetify Vuejs Laravel Admin Template Changelog',
      url: 'https://demos.themeselection.com/sneat-vuetify-vuejs-laravel-admin-template/changelog.html',
    },
  },
}
