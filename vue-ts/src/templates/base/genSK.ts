import type { Tracker } from '@/../types'
import { Utils } from '@/templates/base/helper'
import { error } from '@/utils/logging'
import { removeEmptyDirsRecursively, replaceDir, updateFile } from '@/utils/node'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import { Octokit } from 'octokit'
import path from 'path'
import type { TemplateBaseConfig } from './config'

// TODO: Check do we need to handle extra files for TS/JS
export class GenSK extends Utils {
  constructor(private templateConfig: TemplateBaseConfig, private isJS: boolean) {
    super()
  }

  private removeBuyNow() {
    updateFile(
      path.join(this.tempDir, 'src', 'App.vue'),
      app => app.split('\n')
        .filter(line => !line.includes('BuyNow'))
        .join('\n'),
    )
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
    const octokit = new Octokit({ auth: process.env.githubPersonalToken })

    // Tracker file
    const trackerPath = path.join(this.templateConfig.paths.dataDir, 'tracker.json')
    const tracker: Tracker = (await import(trackerPath)).default

    // Flag to update the tracker if lastUpdatedAt is missing
    let isTrackerDataUpdated = false

    // Thanks: https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
    await Promise.all(
      tracker.map(
        async (trackableFile, index) => {
          // Get commit details of tracking file
          const res = await octokit.request('GET /repos/{owner}/{repo}/commits', {
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

    fs.removeSync(destPath)
    fs.copySync(
      path.join(this.templateConfig.paths.dataDir, 'pages'),
      destPath,
    )
  }

  private updateRouter() {
    updateFile(
      path.join(this.tempDir, 'src', 'router', this.isJS ? 'index.js' : 'index.ts'),
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
        // ❗ Order matters: First of all we will remove i18n, notification & theme-switcher component rendering & import
        data = data.split('\n')
          .filter(line => !['NavBarI18n', 'NavbarThemeSwitcher', 'NavBarNotifications'].some(i => line.includes(i)))
          .join('\n')

        // ❗ Order matters: now let's replace search button with NavbarThemeSwitcher
        data = data.replace(/^(\s+)<\/VBtn>\s+<VBtn(\n|.)*<\/VBtn>/gm, '$1</VBtn>\n\n$1<NavbarThemeSwitcher />')

        // This doesn't require order: Comment out customizer
        data = data.replace(/<TheCustomizer \/>/g, '<!-- <TheCustomizer /> -->')

        return data
      },
    )

    // update default layout /w horizontal nav file
    updateFile(
      path.join(this.tempDir, 'src', 'layouts', 'components', 'DefaultLayoutWithHorizontalNav.vue'),
      (data) => {
        // Remove i18n & notification
        data = data.split('\n')
          .filter(line => !['NavBarI18n', 'NavBarNotifications'].some(i => line.includes(i)))
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
      path.join(this.tempDir, 'src', this.isJS ? 'main.js' : 'main.ts'),
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
      path.join(this.tempDir, `themeConfig.${this.isJS ? 'js' : 'ts'}`),
      themeConfig => themeConfig.replace(/enableI18n: \w+/, 'enableI18n: false'),
    )
  }

  private updateViteConfig() {
    updateFile(
      path.join(this.tempDir, `vite.config.${this.isJS ? 'js' : 'ts'}`),
      (viteConfig) => {
        // Remove i18n plugin
        viteConfig = viteConfig.replace(/VueI18n\({\n((?:\s{6}).*)+\n\s+}\),/gm, '')

        // Remove i18n auto import preset from AutoImport plugin
        viteConfig = viteConfig.replace(/'vue-i18n', /g, '')

        return viteConfig
      },
    )
  }

  private replaceStarterKit() {
    replaceDir(this.tempDir, this.templateConfig.paths.jSStarter)
  }

  async genSK() {
    await this.checkData()

    // Copy project to temp dir
    this.copyProject(
      this.isJS ? this.templateConfig.paths.jSFull : this.templateConfig.paths.tSFull,
      this.tempDir,
      this.templateConfig.packageCopyIgnorePatterns,
    )

    this.removeBuyNow()

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

    // Place temp dir content in js full version
    this.replaceStarterKit()
  }
}
