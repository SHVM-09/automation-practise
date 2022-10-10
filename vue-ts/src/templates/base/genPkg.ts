import path from 'path'
import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'
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
    // SECTION TS
    // Remove buy now from TS Full version
    this.removeBuyNow(this.templateConfig.paths.tSFull)

    // Generate TS SK
    await new GenSK(this.templateConfig).genSK()

    // !SECTION

    // SECTION JS
    // Remove buy now from JS
    this.removeBuyNow(this.templateConfig.paths.jSFull)

    new GenJS(this.templateConfig, true).genJS()

    // !SECTION

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

    // fs.ensureDirSync(path.join(tempPkgDir, 'typescript'))
    // fs.ensureDirSync(path.join(tempPkgDir, 'javascript'))
    // TODO: We will need `documentation.html` file

    this.copyProject(this.templateConfig.paths.tSFull, tempPkgTSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.paths.tSStarter, tempPkgTSStarter, this.templateConfig.packageCopyIgnorePatterns)

    this.copyProject(this.templateConfig.paths.jSFull, tempPkgJSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.paths.jSStarter, tempPkgJSStarter, this.templateConfig.packageCopyIgnorePatterns)

    // Create documentation.html file
    fs.writeFileSync(
      path.join(tempPkgDir, 'documentation.html'),
      generateDocContent(this.templateConfig.documentation.pageTitle, this.templateConfig.documentation.docUrl),
    )

    execCmd(`zip -r materio-vuetify-vuejs-admin-template.zip ${tempPkgTS}`, { cwd: this.templateConfig.projectPath })
    success(`✅ Package generated at: ${this.templateConfig.projectPath}`)
  }
}
