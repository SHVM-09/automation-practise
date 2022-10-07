import path from 'path'
import * as url from 'url'
import type { TemplateBaseConfig } from '@/templates/base'
import { getTemplatePath } from '@/utils/paths'

type MasterConfig = TemplateBaseConfig

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const masterVuePath = path.join(getTemplatePath('master', 'vue'))

export const config: MasterConfig = {
  templateName: 'Master',
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
    '!svg',
    '!pages',
    '!avatars',
  ],
  paths: {
    tSFull: path.join(masterVuePath, 'typescript-version', 'full-version'),
    tSStarter: path.join(masterVuePath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(masterVuePath, 'javascript-version', 'full-version'),
    jSStarter: path.join(masterVuePath, 'javascript-version', 'starter-kit'),
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
  gh: {
    ownerName: 'themeselection',
    repoName: 'master-vue--material',
  },
}
