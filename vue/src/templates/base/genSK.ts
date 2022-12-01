import path from 'path'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import { Octokit } from 'octokit'
import type { TemplateBaseConfig } from './config'
import type { Tracker } from '@/../types'
import { Utils } from '@/templates/base/helper'
import { error } from '@/utils/logging'
import { execCmd, removeEmptyDirsRecursively, replaceDir, updateFile } from '@/utils/node'

// TODO: Check do we need to handle extra files for TS/JS
// TODO: There's ts-expect-error in themeConfig.js
export class GenSK extends Utils {
  constructor(private templateConfig: TemplateBaseConfig) {
    super()
  }

  private removeViews() {
    const viewsPath = path.join(this.tempDir, 'src', 'views')
    // Remove all files except AuthProvider.vue
    globbySync(['**/*'], { cwd: viewsPath, absolute: true })
      .forEach((v) => {
        if (!v.endsWith('AuthProvider.vue'))
          fs.removeSync(v)
      })

    // Remove empty dirs
    removeEmptyDirsRecursively(viewsPath)
  }

  private async checkData() {
    // Load .env file to get GH personal access token
    dotenv.config()

    // create new octokit instance
    const octokit = new Octokit({ auth: process.env.GitHubPersonalToken })

    // Tracker file
    const trackerPath = path.join(this.templateConfig.paths.dataDir, 'tracker.json')
    const tracker: Tracker = (await import(trackerPath)).default

    // Flag to update the tracker if lastUpdatedAt is missing
    let isTrackerDataUpdated = false

    // Thanks: https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
    await Promise.all(
      tracker.map(
        async (trackableFile, index) => {
          // Allow fetching commits from branch other than main
          let url = 'GET /repos/{owner}/{repo}/commits'
          if (this.templateConfig.gh.branch)
            url += `?sha=${this.templateConfig.gh.branch}`

          // Get commit details of tracking file
          const res = await octokit.request(url, {
            owner: this.templateConfig.gh.ownerName,
            repo: this.templateConfig.gh.repoName,
            path: trackableFile.gitRepoFilePath,
          })

          // Get the time of latest commit
          const latestCommit = res.data[0]
          const commitTime = latestCommit.commit.committer?.date

          // If commit time is not defined throw error
          if (!commitTime) {
            error('Can\'t find committer date!')
          }

          // If commit time is not preset in tracker update the tracker file
          else if (!trackableFile.lastUpdatedAt) {
            tracker[index].lastUpdatedAt = commitTime
            isTrackerDataUpdated = true
          }

          // Compare commit time & lastUpdatedAt
          else {
            /*
              Thanks: https://stackoverflow.com/a/16713809/10796681

              If commit time & lastUpdatedAt is different file => Data file needs update
            */
            if (+new Date(trackableFile.lastUpdatedAt) !== +new Date(commitTime)) {
              // ℹ️ We are using array so can simple join to show multiline err
              const err = [`File: ${String(trackableFile.gitRepoFilePath)} has been updated!`]
              err.push(`New commit time: ${String(new Date(commitTime))}`)
              err.push(`Tracker details: ${JSON.stringify(trackableFile)}`)

              error(err.join('\n'))
            }
          }
        },
      ),
    )

    // If tracker data is update => Update the tracker file
    if (isTrackerDataUpdated)
      fs.writeJSONSync(trackerPath, tracker, { spaces: 4 })
  }

  private replacePages() {
    const destPath = path.join(this.tempDir, 'src', 'pages')

    // Temporary move 404 page outside of pages dir because we will remove whole pages dir in upcoming statements
    fs.moveSync(
      path.join(destPath, '[...all].vue'),
      path.join(destPath, '..', '[...all].vue'),
    )

    fs.removeSync(destPath)
    fs.copySync(
      path.join(this.templateConfig.paths.dataDir, 'pages'),
      destPath,
    )

    // Move 404 page from src (we moved above) to pages dir
    fs.moveSync(
      path.join(destPath, '..', '[...all].vue'),
      path.join(destPath, '[...all].vue'),
    )
  }

  private updateRouter() {
    updateFile(
      path.join(this.tempDir, 'src', 'router', 'index.ts'),
      (routerData) => {
        /*
          Remove root route
          ℹ️ We assume we won't add any extra route manually other than root route
          Regex: https://regex101.com/r/uMDiMU/3
        */
        routerData = routerData.replace(/routes: \[(\n|.)*],/gm, 'routes: [\n    ...setupLayouts(routes)\n  ],')

        /*
          Remove router.beforeEach hook
          ℹ️ Assumes last `)}` in router file is of router.beforeEach hook
          Regex: https://regex101.com/r/Dv64Hy/1
        */
        routerData = routerData.replace(/router\.beforeEach(\n|.)*}\)/gm, '')

        // ℹ️ Remove unused imports. We are removing whole line which includes `isUserLoggedIn` import
        routerData = routerData.split('\n')
          .filter(line => !line.includes('isUserLoggedIn'))
          .join('\n')

        return routerData
      },
    )
  }

  private replaceNavigationData() {
    const destPath = path.join(this.tempDir, 'src', 'navigation')

    fs.removeSync(destPath)
    fs.copySync(
      path.join(this.templateConfig.paths.dataDir, 'navigation'),
      destPath,
    )
  }

  private updateLayouts() {
    // update user profile dropdown
    fs.copySync(
      path.join(this.templateConfig.paths.dataDir, 'UserProfile.vue'),
      path.join(this.tempDir, 'src', 'layouts', 'components', 'UserProfile.vue'),
    )

    /*
      update default layout /w vertical nav file
      ❗ Updating file content requires proper order
    */
    updateFile(
      path.join(this.tempDir, 'src', 'layouts', 'components', 'DefaultLayoutWithVerticalNav.vue'),
      (data) => {
        // ❗ Order matters: First of all we will remove i18n, shortcuts, notification & theme-switcher component rendering & import
        // ℹ️ We will use "<NavbarThemeSwitcher" instead of "NavbarThemeSwitcher" because we don't want to remove its import as we will later add NavbarThemeSwitcher again
        data = data.split('\n')
          .filter(line => !['NavSearchBar', 'NavBarI18n', 'NavbarShortcuts', '<NavbarThemeSwitcher', 'NavBarNotifications'].some(i => line.includes(i)))
          .join('\n')

        // ❗ Order matters: now let's NavbarThemeSwitcher just before VSpacer
        data = data.replace(
          /(?<indentation> *)(?<vSpacerOpeningTag><VSpacer)/gm,
          '$<indentation><NavbarThemeSwitcher />\n\n$<indentation>$<vSpacerOpeningTag>',
        )

        // This doesn't require order: Comment out customizer
        data = data.replace(/<TheCustomizer \/>/g, '<!-- <TheCustomizer /> -->')

        return data
      },
    )

    // update default layout /w horizontal nav file
    updateFile(
      path.join(this.tempDir, 'src', 'layouts', 'components', 'DefaultLayoutWithHorizontalNav.vue'),
      (data) => {
        // Remove i18n, shortcuts & notification
        data = data.split('\n')
          .filter(line => !['NavSearchBar', 'NavBarI18n', 'NavbarShortcuts', 'NavBarNotifications'].some(i => line.includes(i)))
          .join('\n')

        // Remove search button
        data = data.replace(/<VBtn(\n|.)*<\/VBtn>/gm, '')

        // add me-2 class to ThemeSwitcher
        data = data.replace(/<NavbarThemeSwitcher \/>/g, '<NavbarThemeSwitcher class="me-2" />')

        // Comment out customizer
        data = data.replace(/<TheCustomizer \/>/g, '<!-- <TheCustomizer /> -->')

        return data
      },
    )
  }

  private updateMainTs() {
    updateFile(
      path.join(this.tempDir, 'src', 'main.ts'),
      (data) => {
        // Remove abilitiesPlugin injection in app instance
        data = data.replace(/app\.use\(abilitiesPlugin.*(\n.*){2}/gm, '')

        // Remove i18n, acl & fake-db => Remove lines that contains specific word
        data = data.split('\n')
          .filter(line => !['casl', 'acl', 'ability', 'i18n', '@fake-db'].some(i => line.includes(i)))
          .join('\n')

        return data
      },
    )
  }

  private removeUnwantedImages() {
    const imagesPath = path.join(this.tempDir, 'src', 'assets', 'images')
    globbySync(this.templateConfig.sKImagesRemovePatterns, { cwd: imagesPath, absolute: true })
      .forEach(i => fs.removeSync(i))

    removeEmptyDirsRecursively(imagesPath)
  }

  private updateThemeConfig() {
    // Set enableI18n to false in themeConfig.ts
    updateFile(
      path.join(this.tempDir, 'themeConfig.ts'),
      themeConfig => themeConfig.replace(/enableI18n: \w+/, 'enableI18n: false'),
    )
  }

  private updateViteConfig() {
    updateFile(
      path.join(this.tempDir, 'vite.config.ts'),
      (viteConfig) => {
        // Remove additional email routes
        viteConfig = viteConfig.replace(
          /(?<pagesStart>Pages\({)(?<beforeOnRoutesGeneratedConfig>(?:.|\n)*\n)(?<commentBeforeOnRoutesGenerated>\n\s*\/\/.*\n)(?<onRoutesGenerated>\s+onRoutesGenerated.*(?:\n\s{7,}.+)+\n.*\n)/gm,
          '$1$2',
        )

        // Remove i18n plugin
        viteConfig = viteConfig.replace(/VueI18n\({\n((?:\s{6}).*)+\n\s+}\),/gm, '')

        // Remove i18n auto import preset from AutoImport plugin
        viteConfig = viteConfig.replace(/'vue-i18n', /g, '')

        // ℹ️ Remove vueI18n import.
        viteConfig = viteConfig.split('\n')
          .filter(line => !line.includes('vite-plugin-vue-i18n'))
          .join('\n')

        return viteConfig
      },
    )
  }

  private replaceStarterKit() {
    replaceDir(this.tempDir, this.templateConfig.paths.tSStarter)
  }

  private formatCode() {
    const sKProjectPath = this.templateConfig.paths.tSStarter

    // ℹ️ Run installation if there's no node_modules
    execCmd('yarn', { cwd: sKProjectPath })

    // ℹ️ Run linting after filling all snippets to auto format
    execCmd('yarn lint', { cwd: sKProjectPath })
  }

  async genSK() {
    await this.checkData()

    // Copy project to temp dir
    this.copyProject(
      this.templateConfig.paths.tSFull,
      this.tempDir,
      this.templateConfig.packageCopyIgnorePatterns,
    )

    this.removeBuyNow(this.tempDir)

    this.removeViews()

    this.replacePages()

    this.updateRouter()

    this.replaceNavigationData()

    // Remove fake-db dir
    fs.removeSync(path.join(this.tempDir, 'src', '@fake-db'))

    this.updateLayouts()

    this.updateMainTs()

    this.removeUnwantedImages()

    this.updateThemeConfig()

    this.updateViteConfig()

    // Place temp dir content in ts/js starter-kit
    this.replaceStarterKit()

    this.formatCode()
  }
}
