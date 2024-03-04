import type { TemplateRepoName } from './getPaths'

type Links = 'changelog' | 'docs' | 'marketplaceDocs'

export interface TemplateConfig {
  fullName: string
  shortName: string
  ignoreCompressionPatterns: string[]
  packageIgnoreCopyPatterns: string[]
  links: Record<Links, string>
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
    }
  }
}
