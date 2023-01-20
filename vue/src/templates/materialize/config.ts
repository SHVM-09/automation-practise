import path from 'path'
import * as url from 'url'

import type { TemplateBaseConfig } from '@/templates/base'
import { pixinvent as pixinventGTMConfig } from '@/templates/base/gtmConfig'
import '@/utils/injectMustReplace'
import { getTemplatePath } from '@/utils/paths'

type MaterializeConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const materializeVuePath = path.join(getTemplatePath('materialize', 'vue'))
const materializeVueLaravelPath = path.join(getTemplatePath('materialize', 'vue-laravel'))
const materializeVueFreePath = materializeVuePath.mustReplace('vue', 'vue-free')

export const config: MaterializeConfig = {
  templateName: 'Materialize',
  templateDomain: 'pi',
  projectPath: materializeVuePath,
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
    tSFull: path.join(materializeVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(materializeVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(materializeVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(materializeVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
    freeTS: path.join(materializeVueFreePath, 'typescript-version'),
    freeJS: path.join(materializeVueFreePath, 'javascript-version'),
    docs: path.join(materializeVuePath, 'docs'),
  },
  // ℹ️ We will explicitly make all demos either light or dark
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
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/demo/materialize-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
  documentation: {
    pageTitle: 'Materialize - Vuetify Vuejs Admin Template',
    docUrl: 'https://pixinvent.com/demo/materialize-vuejs-admin-template/documentation/',
  },
  gh: {
    ownerName: 'pixinvent',
    repoName: 'materialize-vuetify-vuejs-admin-template',
    branch: 'main',
  },
  gtm: pixinventGTMConfig,
  laravel: {
    pkgName: 'materialize-vuejs-laravel-admin-template',
    projectPath: materializeVueLaravelPath,
    paths: {
      TSFull: path.join(materializeVueLaravelPath, 'typescript-version', 'full-version'),
      TSStarter: path.join(materializeVueLaravelPath, 'typescript-version', 'starter-kit'),
      JSFull: path.join(materializeVueLaravelPath, 'javascript-version', 'full-version'),
      JSStarter: path.join(materializeVueLaravelPath, 'javascript-version', 'starter-kit'),
    },
    demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/demo/materialize-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}/`,
    documentation: {
      pageTitle: 'Materialize - Vuetify Vuejs Laravel Admin Template',
      docUrl: 'https://pixinvent.com/demo/materialize-vuejs-admin-template/documentation/guide/laravel-integration/folder-structure.html',
    },
    demoPathOnServer: (demoNumber, isStaging) => `/demo/materialize-vuejs-laravel-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}`,
  },
}
