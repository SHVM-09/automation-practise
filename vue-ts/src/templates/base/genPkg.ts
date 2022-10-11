import path from 'path'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
import { FillSnippets } from './fillSnippets'
import { GenJS } from './genJS'
import { GenSK } from './genSK'
import { Utils } from '@/templates/base/helper'
import { success } from '@/utils/logging'
import { execCmd } from '@/utils/node'
import { TempLocation } from '@/utils/temp'
import { generateDocContent } from '@/utils/template'

export class GenPkg extends Utils {
  constructor(private templateConfig: TemplateBaseConfig) {
    super()
  }

  async genPkg() {
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

    execCmd(`zip -r materio-vuetify-vuejs-admin-template.zip ${tempPkgTS}`, { cwd: this.templateConfig.projectPath })
    success(`✅ Package generated at: ${this.templateConfig.projectPath}`)
  }
}