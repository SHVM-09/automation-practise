import type { TemplateRepoName } from './getPaths'

export interface TemplateConfig {
  fullName: string
  shortName: string
  ignoreCompressionPatterns: string[]
  packageIgnoreCopyPatterns: string[]
  docsBaseUrl: string
  docsStagingBaseUrl: string
  links: {
    changelog: string
    docs: string
  }
  menuIcons: {
    home: string
    about: string
  }
}

export type Configs = Partial<Record<TemplateRepoName, TemplateConfig>>

export const templateConfig: Configs = {
  materio: {
    fullName: 'Materio - MUI Next.js Admin Template',
    shortName: 'Materio',
    ignoreCompressionPatterns: [
      '**/*/menu-bg-image.png',
      '**/*/cards/1.png',
      '**/*/cards/activity-timeline.png',
      '**/*/illustrations/characters/9.png'
    ],
    packageIgnoreCopyPatterns: [
      // Directories
      '**/.git',
      '**/.github',
      '**/.next',
      '**/node_modules',
      '**/hook-examples',
      '**/menu-examples',

      // Files
      '**/*/menu-bg-image.png',
      '**/*.log',
      '**/*.zip'
    ],
    docsBaseUrl: '/materio-mui-nextjs-admin-template/documentation',
    docsStagingBaseUrl: '/materio-mui-nextjs-admin-template/staging/documentation',
    links: {
      changelog: 'https://demos.themeselection.com/materio-mui-nextjs-admin-template/changelog.html',
      docs: 'https://demos.themeselection.com/materio-mui-nextjs-admin-template/documentation'
    },
    menuIcons: {
      home: 'ri-home-smile-line',
      about: 'ri-information-line'
    }
  },
  vuexy: {
    fullName: 'Vuexy - MUI Next.js Admin Template',
    shortName: 'Vuexy',
    ignoreCompressionPatterns: [
      '**/*/menu-bg-image.png',
      '**/*/cards/1.png',
      '**/*/pages/profile-banner.png',
      '**/*/illustrations/auth/v2-register-dark-border.png',
      '**/*/illustrations/auth/v2-register-dark.png',
      '**/*/illustrations/characters-with-objects/2.png'
    ],
    packageIgnoreCopyPatterns: [
      // Directories
      '**/.git',
      '**/.github',
      '**/.next',
      '**/node_modules',
      '**/hook-examples',
      '**/menu-examples',

      // Files
      '**/*/menu-bg-image.png',
      '**/*.log',
      '**/*.zip'
    ],
    docsBaseUrl: '/vuexy-nextjs-admin-template/documentation',
    docsStagingBaseUrl: '/vuexy-nextjs-admin-template/staging/documentation',
    links: {
      changelog: 'https://demos.pixinvent.com/vuexy/changelog.html',
      docs: 'https://demos.pixinvent.com/vuexy-nextjs-admin-template/documentation'
    },
    menuIcons: {
      home: 'tabler-smart-home',
      about: 'tabler-info-circle'
    }
  }
}
