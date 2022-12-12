import path from 'path'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { FillSnippets } from './fillSnippets'
import { GenJS } from './genJS'
import { GenSK } from './genSK'
import { Utils } from '@/templates/base/helper'
import { error, success } from '@/utils/logging'
import { ask, execCmd } from '@/utils/node'
import { TempLocation } from '@/utils/temp'
import { generateDocContent } from '@/utils/template'

export class GenPkg extends Utils {
  constructor(private templateConfig: TemplateBaseConfig) {
    super()
  }

  async genPkg(isInteractive = true) {
    const { tSFull, jSFull } = this.templateConfig.paths

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

    // Remove BuyNow from both full versions
    this.removeBuyNow(tempPkgTSFull)
    this.removeBuyNow(tempPkgJSFull)

    // Create documentation.html file
    fs.writeFileSync(
      path.join(tempPkgDir, 'documentation.html'),
      generateDocContent(this.templateConfig.documentation.pageTitle, this.templateConfig.documentation.docUrl),
    )

    if (isInteractive) {
      const tempPkgTSFullPackageJsonPath = path.join(tempPkgTSFull, 'package.json')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkgJson: Record<string, any> = fs.readJsonSync(tempPkgTSFullPackageJsonPath)

      const packageVersionToUpdate = await ask(`Optional, Update package version in package.json. (Current version: ${pkgJson.version as string}) Don't prefix 'v': `)

      console.log('packageVersionToUpdate :>> ', packageVersionToUpdate)

      if (packageVersionToUpdate) {
        // Check if input is valid version
        if (!/(\d\.){2}\d/.test(packageVersionToUpdate))
          error(`Entered version: ${packageVersionToUpdate} doesn't match the pattern. e.g. 0.0.0`)

        // Loop over all package.json files and update version
        ;[tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].forEach((tempPkgPath) => {
          const pkgJsonPath = path.join(tempPkgPath, 'package.json')

          const pkgJson = fs.readJSONSync(pkgJsonPath)
          pkgJson.version = packageVersionToUpdate

          fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 })
        })
      }
    }

    const zipPath = path.join(
      this.templateConfig.projectPath,
      `${this.templateConfig.templateName.toLowerCase()}-vuetify-vuejs-admin-template.zip`,
    )
    execCmd(`zip -r ${zipPath} .`, { cwd: tempPkgDir })
    success(`✅ Package generated at: ${this.templateConfig.projectPath}`)
  }
}
