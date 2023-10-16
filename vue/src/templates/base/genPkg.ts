import path from 'node:path'
import type { GenPkgHooks } from '@types'
import { consola } from 'consola'
import { colorize } from 'consola/utils'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { FillSnippets } from './fillSnippets'
import { GenJS } from './genJS'
import { GenSK } from './genSK'
import { updatePkgJsonVersion } from '@/utils/template'
import { TempLocation } from '@/utils/temp'
import { execCmd } from '@/utils/node'
import { compressOverSizedFiles, getPackagesVersions, pinPackagesVersions } from '@/utils/file'
import { Utils } from '@/templates/base/helper'

export class GenPkg extends Utils {
  constructor(private templateConfig: TemplateBaseConfig, private hooks: GenPkgHooks) {
    super()
  }

  async genPkg(isInteractive = true, newPkgVersion?: string) {
    const { tSFull, jSFull } = this.templateConfig.paths

    const compressedFiles = await compressOverSizedFiles(
      `${tSFull}/src/assets/images`,
      isInteractive,
      {
        reportPathRelativeTo: tSFull,
      },
    )

    // Ask user to commit the compressed images
    if (isInteractive && compressedFiles.length) {
      consola.warn('If you want to commit compressed images, make sure you don\'t have extra changes except compressed images.')
      const shouldCommit = await consola.prompt('Do you want to commit the compressed images?', {
        type: 'confirm',
      })

      if (shouldCommit) {
        execCmd('git add .', { cwd: tSFull })
        execCmd('git commit -m "chore: compress images"', { cwd: tSFull })
        consola.success('Compressed images committed successfully.')
      }
    }
    consola.success('Image size validation completed\n')

    // Generate TS SK
    consola.start('Generating TS starter kit')
    await new GenSK(this.templateConfig).genSK()
    consola.success('Starter kit generated successfully\n')

    // Generate JS Full
    consola.start('Generating JS version')
    await new GenJS(this.templateConfig).genJS()
    consola.success('JS version generated successfully\n')

    //  Generate JS SK
    consola.start('Generating JS starter kit')
    await new GenJS(this.templateConfig, true).genJS()
    consola.success('JS starter kit generated successfully\n')

    // Fill snippets
    consola.start('Filling snippets')
    new FillSnippets(tSFull, jSFull).fillSnippet()
    consola.success('Snippets updated successfully\n')

    // Create new temp dir for storing pkg
    const tempPkgDir = new TempLocation().tempDir
    consola.start(`Preparing package at: ${tempPkgDir}`)

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

    consola.start('Copying files to temp package dir')
    this.copyProject(this.templateConfig.paths.tSFull, tempPkgTSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.paths.tSStarter, tempPkgTSStarter, this.templateConfig.packageCopyIgnorePatterns)

    this.copyProject(this.templateConfig.paths.jSFull, tempPkgJSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.paths.jSStarter, tempPkgJSStarter, this.templateConfig.packageCopyIgnorePatterns)
    consola.success('Files copied successfully\n')

    // update node package version in both full versions and starter kits package.json file (ts/js)
    consola.start('Updating package.json files to pin package versions')
    const packageVersions = getPackagesVersions(tSFull)
    pinPackagesVersions(packageVersions, tempPkgTSFull)
    pinPackagesVersions(packageVersions, tempPkgTSStarter)
    pinPackagesVersions(packageVersions, tempPkgJSFull)
    pinPackagesVersions(packageVersions, tempPkgJSStarter)
    consola.success('Package versions pinned successfully\n')

    consola.start('Removing unwanted files')
    // Remove BuyNow from both full versions
    this.removeBuyNow(tempPkgTSFull)
    this.removeBuyNow(tempPkgJSFull)

    execCmd(`rm -rf ${path.join(tempPkgTSFull, 'src', 'pages', 'pages', 'test')}`)
    execCmd(`rm -rf ${path.join(tempPkgJSFull, 'src', 'pages', 'pages', 'test')}`)
    // remove icon.css file from all version
    ;[tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].forEach((projectPath) => {
      fs.removeSync(path.join(projectPath, 'src', 'plugins', 'iconify', 'icons.css'))
    })

    consola.success('Unwanted files removed successfully\n')

    // package version for package name
    // ℹ️ If we run script non-interactively and don't pass package version, pkgVersionForZip will be null => we won't prepend version to package name
    let pkgVersionForZip: string | null = null

    // ℹ️ We might not need this in future if we correctly handle `postProcessGeneratedPkg` hook
    // Copy documentation.html file from root of the repo
    consola.info(colorize('cyanBright', 'We have disabled copying documentation in base script because we are copying it in post process hook. Let\'s check if we really need this in PI based templates?'))
    // fs.copyFileSync(
    //   path.join(this.templateConfig.projectPath, 'documentation.html'),
    //   path.join(tempPkgDir, 'documentation.html'),
    // )
    // consola.success('Documentation file copied successfully\n')

    if (isInteractive || newPkgVersion) {
      const tempPkgTSFullPackageJsonPath = path.join(tempPkgTSFull, 'package.json')

      pkgVersionForZip = await updatePkgJsonVersion(
        [tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].map(p => path.join(p, 'package.json')),
        tempPkgTSFullPackageJsonPath,
        newPkgVersion,
      )
    }
    consola.success('Package version updated successfully\n')

    // Ask for running `postProcessGeneratedPkg` if pixinvent
    if (this.templateConfig.templateDomain === 'pi') {
      consola.info(colorize('cyanBright', 'We have disabled running post process hook for PI based template due to incomplete hook'))
      const shouldInjectInPreviousPackage = false
      // const shouldInjectInPreviousPackage = await consola.prompt('Vue package is ready to rock, Do you want me to inject it in last pkg?', {
      //   type: 'confirm',
      // })
      if (shouldInjectInPreviousPackage)
        await this.hooks.postProcessGeneratedPkg(tempPkgDir)
    }
    else {
      await this.hooks.postProcessGeneratedPkg(tempPkgDir)
    }
    consola.success('Package `postProcessGeneratedPkg` hook ran successfully\n')

    // Prepare zip
    consola.start('Preparing zip')
    const zipPath = path.join(
      this.templateConfig.projectPath,
      `${this.templateConfig.templateName}${this.templateConfig.templateDomain === 'ts' ? '-vuetify' : ''}-vuejs-admin-template${pkgVersionForZip ? `-v${pkgVersionForZip}` : ''}.zip`,
    )
    execCmd(`zip -r ${zipPath} .`, { cwd: tempPkgDir })
    consola.success(`Package generated at: ${this.templateConfig.projectPath}\n`)
  }
}
