import type { TemplateRepoName } from './getPaths'

export interface TemplateConfig {
  fullName: string
  shortName: string
  ignoreCompressionPatterns: string[]
  packageIgnoreCopyPatterns: string[]
  links: {
    changelog: string
    docs: string
    marketplaceDocs?: string
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
      // '**/activity-timeline.png'
    ],
    packageIgnoreCopyPatterns: [
      // Directories
      '**/.git',
      '**/.github',
      '**/.next',
      '**/node_modules',

      // Files
      '**/*.log',
      '**/*.zip'
    ],
    links: {
      changelog: 'https://demos.themeselection.com/materio-mui-nextjs-admin-template/changelog.html',
      docs: 'https://demos.themeselection.com/materio-mui-nextjs-admin-template/documentation',
      marketplaceDocs: 'https://demos.themeselection.com/marketplace/materio-mui-nextjs-admin-template/documentation'
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
    ],
    packageIgnoreCopyPatterns: [
      // Directories
      '**/.git',
      '**/.github',
      '**/.next',
      '**/node_modules',

      // Files
      '**/*.log',
      '**/*.zip'
    ],
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
