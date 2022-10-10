import path from 'path'
import * as url from 'url'
import type { TemplateBaseConfig } from '@/templates/base'
import { getTemplatePath } from '@/utils/paths'

type MaterioConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const materioVuePath = path.join(getTemplatePath('materio', 'vue'))

export const config: MaterioConfig = {
  templateName: 'Materio',
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
  ],
  sKImagesRemovePatterns: [
    '**/*',
    '!svg',
    '!pages',
    '!avatars',
    '!misc',
  ],
  paths: {
    tSFull: path.join(materioVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(materioVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(materioVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(materioVuePath, 'javascript-version', 'starter-kit'),
    dataDir: path.join(__dirname, 'data'),
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
  demoDeploymentBase: (demoNumber: number, isStaging: boolean) => `/materio-vuetify-vuejs-admin-template${isStaging ? '/staging' : ''}/demo-${demoNumber}`,
  documentation: {
    pageTitle: 'Materio - Vuetify Vuejs Admin Template',
    docUrl: 'https://demos.themeselection.com/materio-vuetify-vuejs-admin-template/documentation/',
  },
  gh: {
    ownerName: 'themeselection',
    repoName: 'materio-vuetify-vuejs-admin-template',
  },
}
