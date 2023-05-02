import path from 'path'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { Octokit } from 'octokit'

import type { TemplateBaseConfig } from '@templates/base'
import { TemplateBase } from '@templates/base'

import { error, info, success } from '@/utils/logging'
import { downloadFile, execCmd } from '@/utils/node'
import { TempLocation } from '@/utils/temp'

export class PixInventTemplate extends TemplateBase {
  constructor(public override config: TemplateBaseConfig) {
    super(config)
  }

  override async postProcessGeneratedPkg(tempPkgDir: string, isLaravel = false): Promise<void> {
    dotenv.config()
    const octokit = new Octokit({ auth: process.env.GitHubPersonalToken })

    // Download latest package from releases and store it in temp dir
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: this.config.gh.ownerName,
      repo: `${this.config.templateName}-releases`,
    })

    // Validate release assets
    if (data.assets.length !== 1)
      error(`Expected only one release asset from latest release but got ${data.assets.length}.\nVisit ${data.html_url} to check the release.`)

    const asset = data.assets[0]

    // Create new temp dir for storing latest release
    const tempReleaseAssetDir = new TempLocation().tempDir

    console.log('asset.browser_download_url :>> ', JSON.stringify(asset))

    info('⬇️ Downloading latest release asset...')
    await downloadFile(asset.browser_download_url, path.join(tempReleaseAssetDir, asset.name))
    success('✅ Downloaded latest release asset.')

    // Extract the package
    execCmd(`unzip -qq ${asset.name}`, { cwd: tempReleaseAssetDir })

    const pkgName = `${isLaravel ? 'vue-laravel' : 'vue'}-version`

    // replace generated package with extracted package's vue package
    // Empty technology directory of last (released) pkg
    fs.emptyDirSync(path.join(tempReleaseAssetDir, pkgName))

    // Copy latest pkg to last (released) pkg's technology directory
    execCmd(`cp -r ${path.join(tempPkgDir, '*')} ${path.join(tempReleaseAssetDir, pkgName)}`)

    // Now out `tempReleaseAssetDir` is the new latest pkg. Copy the content of it to `tempPkgDir` for resuming pipeline

    // Empty tempPkgDir dir
    fs.emptyDirSync(path.join(tempPkgDir, pkgName))

    // Copy new pkg content to tempPkgDir
    execCmd(`cp -r ${path.join(tempReleaseAssetDir, '*')} ${tempPkgDir}`)

    // Log that we are assuming others will update readme, changelog, hire-us.
    info('Assuming readme, changelog, hire-us in the root of the package is already updated.')
  }
}

