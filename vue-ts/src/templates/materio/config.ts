import path from 'path'
import type { TemplateBaseConfig } from '@/templates/base'
import { getTemplatePath } from '@/utils/paths'

type MaterioConfig = TemplateBaseConfig

const projectPath = path.join(getTemplatePath('materio', 'vue'))

export const config: MaterioConfig = {
  templateName: 'Materio',
  projectPath,
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
  paths: {
    tSFull: path.join(projectPath, 'typescript-version', 'full-version'),
    tSStarter: path.join(projectPath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(projectPath, 'javascript-version', 'full-version'),
    jSStarter: path.join(projectPath, 'javascript-version', 'starter-kit'),
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
}
