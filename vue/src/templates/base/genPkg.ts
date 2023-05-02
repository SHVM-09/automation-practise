import path from 'path'
import type { GenPkgHooks } from '@types'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { FillSnippets } from './fillSnippets'
import { GenJS } from './genJS'
import { GenSK } from './genSK'
import { Utils } from '@/templates/base/helper'
import { compressOverSizedFiles, getPackagesVersions, pinPackagesVersions } from '@/utils/file'
import { success, warning } from '@/utils/logging'
import { askBoolean, execCmd } from '@/utils/node'
import { TempLocation } from '@/utils/temp'
import { updatePkgJsonVersion } from '@/utils/template'

export class GenPkg extends Utils {
  constructor(private templateConfig: TemplateBaseConfig, private hooks: GenPkgHooks) {
    super()
  }

  async genPkg(isInteractive = true, newPkgVersion?: string) {
    const { tSFull, jSFull } = this.templateConfig.paths

    const compressedFiles = await compressOverSizedFiles(`${tSFull}/src/assets/images`, {
      reportPathRelativeTo: tSFull,
    })

    // Ask user to commit the compressed images
    if (isInteractive && compressedFiles.length) {
      warning('If you want to commit compressed images, make sure you don\'t have extra changes except compressed images.')
      const shouldCommit = await askBoolean('Do you want to commit the compressed images?')

      if (shouldCommit) {
        execCmd('git add .', { cwd: tSFull })
        execCmd('git commit -m "chore: compress images"', { cwd: tSFull })
        success('✅ Compressed images committed successfully.')
      }
    }

    // Generate TS SK
    await new GenSK(this.templateConfig).genSK()

    // Generate JS Full
    new GenJS(this.templateConfig).genJS()

    //  Generate JS SK
    new GenJS(this.templateConfig, true).genJS()

    // Fill snippets
    new FillSnippets(tSFull, jSFull).fillSnippet()

    // Create new temp dir for storing pkg
    const tempPkgDir = new TempLocation().tempDir
    const tempPkgTS = path.join(tempPkgDir, 'typescript-version')
    const tempPkgJS = path.join(tempPkgDir, 'javascript-version')

    const tempPkgTSFull = path.join(tempPkgTS, 'full-version')
    const tempPkgTSStarter = path.join(tempPkgTS, 'starter-kit')

    // Create dirs
    fs.ensureDirSync(tempPkgTSFull)
    fs.ensureDirSync(tempPkgTSStarter)

    const tempPkgJSFull = path.join(tempPkgJS, 'full-version')
    const tempPkgJSStarter = path.join(tempPkgJS, 'starter-kit')

    // Create dirs
    fs.ensureDirSync(tempPkgJSFull)
    fs.ensureDirSync(tempPkgJSStarter)

    this.copyProject(this.templateConfig.paths.tSFull, tempPkgTSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.paths.tSStarter, tempPkgTSStarter, this.templateConfig.packageCopyIgnorePatterns)

    this.copyProject(this.templateConfig.paths.jSFull, tempPkgJSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.paths.jSStarter, tempPkgJSStarter, this.templateConfig.packageCopyIgnorePatterns)

    // update node package version in both full versions and starter kits package.json file (ts/js)
    const packageVersions = getPackagesVersions(tSFull)
    pinPackagesVersions(packageVersions, tempPkgTSFull)
    pinPackagesVersions(packageVersions, tempPkgTSStarter)
    pinPackagesVersions(packageVersions, tempPkgJSFull)
    pinPackagesVersions(packageVersions, tempPkgJSStarter)

    // Remove BuyNow from both full versions
    this.removeBuyNow(tempPkgTSFull)
    this.removeBuyNow(tempPkgJSFull)

    execCmd(`rm -rf ${path.join(tempPkgTSFull, 'src', 'pages', 'pages', 'test')}`)
    execCmd(`rm -rf ${path.join(tempPkgJSFull, 'src', 'pages', 'pages', 'test')}`)

    // package version for package name
    // ℹ️ If we run script non-interactively and don't pass package version, pkgVersionForZip will be null => we won't prepend version to package name
    let pkgVersionForZip: string | null = null

    // Copy documentation.html file from root of the repo
    fs.copyFileSync(
      path.join(this.templateConfig.projectPath, 'documentation.html'),
      path.join(tempPkgDir, 'documentation.html'),
    )

    if (isInteractive || newPkgVersion) {
      const tempPkgTSFullPackageJsonPath = path.join(tempPkgTSFull, 'package.json')

      pkgVersionForZip = await updatePkgJsonVersion(
        [tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].map(p => path.join(p, 'package.json')),
        tempPkgTSFullPackageJsonPath,
        newPkgVersion,
      )
    }

    // Ask for running `postProcessGeneratedPkg` if pixinvent
    if (this.templateConfig.templateDomain === 'pi') {
      if (await askBoolean('Vue package is ready to rock, Do you want me to inject it in last pkg?'))
        await this.hooks.postProcessGeneratedPkg(tempPkgDir)
    }
    else {
      await this.hooks.postProcessGeneratedPkg(tempPkgDir)
    }

    // Prepare zip
    const zipPath = path.join(
      this.templateConfig.projectPath,
      `${this.templateConfig.templateName}${this.templateConfig.templateDomain === 'ts' ? '-vuetify' : ''}-vuejs-admin-template${pkgVersionForZip ? `-v${pkgVersionForZip}` : ''}.zip`,
    )
    execCmd(`zip -r ${zipPath} .`, { cwd: tempPkgDir })
    success(`✅ Package generated at: ${this.templateConfig.projectPath}`)
  }
}
