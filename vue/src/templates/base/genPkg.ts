import path from 'node:path'
import type { GenPkgHooks } from '@types'
import { consola } from 'consola'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { FillSnippets } from './fillSnippets'
import { GenJS } from './genJS'
import { GenSK } from './genSK'
import { updatePkgJsonVersion } from '@/utils/template'
import { TempLocation } from '@/utils/temp'
import { execCmd } from '@/utils/node'
import { compressOverSizedFiles, getPackagesVersions, removeCaretTildeFromPackageJson, updatePackagesVersions } from '@/utils/file'
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
        ignorePatterns: this.templateConfig.ignoreCompressionPatterns,
      },
    )

    // Ask user to commit the compressed images
    if (isInteractive && compressedFiles.length) {
      const shouldCommit = await consola.prompt('Do you want to commit the compressed images?', {
        type: 'confirm',
      })

      if (shouldCommit) {
        const files_to_stage = compressedFiles.map(f => f.filePath).join(' ')
        execCmd(`git add ${files_to_stage}`, { cwd: tSFull })
        execCmd('git commit -m "chore: compress images"', { cwd: tSFull })
        consola.success('Compressed images committed successfully.')
      }
    }

    // Update packages versions
    const pkgVersionPromise = getPackagesVersions(tSFull)
    // Update packages versions
    await updatePackagesVersions(pkgVersionPromise, tSFull)
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
    await new FillSnippets(tSFull, jSFull).fillSnippet()
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

    // Copy documentation file
    fs.copyFileSync(
      path.join(this.templateConfig.projectPath, 'documentation.html'),
      path.join(tempPkgDir, 'documentation.html'),
    )
    consola.success('Documentation file copied successfully\n')

    if (isInteractive || newPkgVersion) {
      const tempPkgTSFullPackageJsonPath = path.join(tempPkgTSFull, 'package.json')

      pkgVersionForZip = await updatePkgJsonVersion(
        [tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].map(p => path.join(p, 'package.json')),
        tempPkgTSFullPackageJsonPath,
        newPkgVersion,
      )
    }
    consola.success('Package version updated successfully\n')

    // Remove caret and tilde from package.json
    ;[tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].forEach((projectPath) => {
      removeCaretTildeFromPackageJson(projectPath)
    })

    // package version remove extra v from package name if it's there
    pkgVersionForZip = newPkgVersion || `v${pkgVersionForZip}`
    // Prepare zip
    consola.start('Preparing zip')
    const zipPath = path.join(
      this.templateConfig.projectPath,
      `${this.templateConfig.templateName}${this.templateConfig.templateDomain === 'ts' ? '-vuetify' : ''}-vuejs-admin-template${pkgVersionForZip ? `-${pkgVersionForZip}` : ''}.zip`,
    )
    execCmd(`zip -r ${zipPath} . -x "*.DS_Store" -x "*__MACOSX"`, { cwd: tempPkgDir })
    consola.success(`Package generated at: ${this.templateConfig.projectPath}\n`)
  }
}
