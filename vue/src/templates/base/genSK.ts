import path from 'node:path'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import { Octokit } from 'octokit'

import type { Tracker } from '@types'
import { consola } from 'consola'
import { loadFile, writeFile } from 'magicast'
import type { TemplateBaseConfig } from './config'

import { Utils } from '@/templates/base/helper'
import '@/utils/injectMustReplace'
import { execCmd, removeEmptyDirsRecursively, replaceDir, updateFile } from '@/utils/node'

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
    // eslint-disable-next-line n/prefer-global/process
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
            consola.error(new Error('Can\'t find committer date!'))
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

              consola.error(new Error(err.join('\n')))
            }
          }
        },
      ),
    )

    // If tracker data is update => Update the tracker file
    if (isTrackerDataUpdated)
      fs.writeJSONSync(trackerPath, tracker, { spaces: 2 })
  }

  private replacePages() {
    const destPath = path.join(this.tempDir, 'src', 'pages')

    // Temporary move 404 page outside of pages dir because we will remove whole pages dir in upcoming statements
    fs.moveSync(
      path.join(destPath, '[...error].vue'),
      path.join(destPath, '..', '[...error].vue'),
    )

    fs.removeSync(destPath)
    fs.copySync(
      path.join(this.templateConfig.paths.dataDir, 'pages'),
      destPath,
    )

    // Move 404 page from src (we moved above) to pages dir
    fs.moveSync(
      path.join(destPath, '..', '[...error].vue'),
      path.join(destPath, '[...error].vue'),
    )
  }

  private updateRouter() {
    updateFile(
      path.join(this.tempDir, 'src', 'plugins', 'router', 'index.ts'),
      (routerData) => {
        /*
          Remove root route
          ℹ️ We assume we won't add any extra route manually other than root route
          Regex: https://regex101.com/r/0TgITH/1
        */
        routerData = routerData.mustReplace(/extendRoutes: pages => \[(\n|.)*],/gm, 'extendRoutes: pages => [\n   ...[...pages].map(route => recursiveLayouts(route))\n  ],')

        /*
          Remove router.beforeEach hook
          ℹ️ Assumes last `)}` in router file is of router.beforeEach hook
          Regex: https://regex101.com/r/ywccpB/1
        */
        routerData = routerData.mustReplace(/setupGuards\(router\)/gm, '')

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
          .filter(line => !['NavSearchBar', 'NavbarShortcuts', '<NavbarThemeSwitcher', 'NavBarNotifications'].some(i => line.includes(i)))
          .join('\n')

        // ❗ Order matters: now let's NavbarThemeSwitcher just before VSpacer
        data = data.mustReplace(
          /(?<indentation> *)(?<vSpacerOpeningTag><VSpacer)/gm,
          '$<indentation><NavbarThemeSwitcher />\n\n$<indentation>$<vSpacerOpeningTag>',
        )

        // This doesn't require order: Comment out customizer
        data = data.mustReplace(/<TheCustomizer \/>/g, '<!-- <TheCustomizer /> -->')

        return data
      },
    )

    // update default layout /w horizontal nav file
    updateFile(
      path.join(this.tempDir, 'src', 'layouts', 'components', 'DefaultLayoutWithHorizontalNav.vue'),
      (data) => {
        // Remove i18n, shortcuts & notification
        data = data.split('\n')
          .filter(line => !['NavSearchBar', 'NavbarShortcuts', 'NavBarNotifications'].some(i => line.includes(i)))
          .join('\n')

        // Remove search button
        // data = data.mustReplace(/<VBtn(\n|.)*<\/VBtn>/gm, '')

        // add me-2 class to ThemeSwitcher regardless of existing me-\d+ class
        data = data.mustReplace(/<NavbarThemeSwitcher (class="me-\d+" )?\/>/g, '<NavbarThemeSwitcher class="me-2" />')

        // Comment out customizer
        data = data.mustReplace(/<TheCustomizer \/>/g, '<!-- <TheCustomizer /> -->')

        return data
      },
    )
  }

  private removeBuyNowButton() {
    updateFile(
      path.join(this.tempDir, 'src', 'App.vue'),
      (data) => {
        // Remove abilitiesPlugin injection in app instance
        data = data.mustReplace(/<BuyNow \/>/gm, '')

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
      themeConfig => themeConfig.mustReplace(/i18n: {\n *enable: true,/gm, 'i18n: {\n enable: false,'),
    )
  }

  private async updateViteConfig() {
    updateFile(
      path.join(this.tempDir, 'vite.config.ts'),
      (viteConfig) => {
        // Remove i18n plugin
        viteConfig = viteConfig.mustReplace(/VueI18nPlugin\({\n((?:\s{6}).*)+\n\s+}\),/gm, '')

        // Remove i18n auto import preset from AutoImport plugin
        // viteConfig = viteConfig.mustReplace(/'vue-i18n', /g, '')

        // ℹ️ Remove vueI18n import.
        viteConfig = viteConfig.split('\n')
          .filter(line => !line.includes('unplugin-vue-i18n'))
          .join('\n')

        return viteConfig
      },
    )

    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')
    const mod = await loadFile(viteConfigPath)

    await writeFile(mod.$ast, viteConfigPath, {
      quote: 'single',
      trailingComma: true,
    })
  }

  private replaceStarterKit() {
    replaceDir(this.tempDir, this.templateConfig.paths.tSStarter)
  }

  private formatCode() {
    const sKProjectPath = this.templateConfig.paths.tSStarter

    // ℹ️ Run installation if there's no node_modules
    execCmd('pnpm install', { cwd: sKProjectPath })

    // ℹ️ Run linting after filling all snippets to auto format
    execCmd('pnpm lint', { cwd: sKProjectPath })
  }

  async genSK() {
    await this.checkData()

    // Copy project to temp dir
    this.copyProject(
      this.templateConfig.paths.tSFull,
      this.tempDir,
      this.templateConfig.packageCopyIgnorePatterns,
    )

    this.removeViews()

    this.replacePages()

    this.updateRouter()

    this.replaceNavigationData()

    // Remove fake-api  dir
    fs.removeSync(path.join(this.tempDir, 'src', 'plugins', 'fake-api'))
    fs.removeSync(path.join(this.tempDir, 'src', 'plugins', 'router', 'additional-routes.ts'))
    fs.removeSync(path.join(this.tempDir, 'src', 'plugins', 'router', 'guards.ts'))

    this.updateLayouts()

    this.removeBuyNowButton()

    this.removeUnwantedImages()

    this.updateThemeConfig()

    await this.updateViteConfig()

    // Place temp dir content in ts/js starter-kit
    this.replaceStarterKit()

    this.formatCode()
  }
}
