import path from 'node:path'
import type { TemplateBaseConfig } from '@templates/base'
import { TemplateBase } from '@templates/base'
import { consola } from 'consola'
import fs from 'fs-extra'
import { updateFile } from '@/utils/node'
import { genRedirectionHtmlFile } from '@/utils/file'

import '@/utils/injectMustReplace'

export class ThemeSelectionTemplate<TemplateConfig extends TemplateBaseConfig> extends TemplateBase<TemplateConfig> {
  constructor(public override config: TemplateConfig) {
    super(config)
  }

  override async postProcessGeneratedPkg(tempPkgDir: string, isLaravel = false, isFree = false): Promise<void> {
    const isMaster = this.config.templateName === 'master'

    // ℹ️ Master don't have documentation & hire us file
    if (!isMaster) {
      // Copy files to the root of the package
      ['documentation.html', 'hire-us.html'].forEach((fileName) => {
        fs.copyFileSync(
          path.join(this.config.projectPath, fileName),
          path.join(tempPkgDir, fileName),
        )
        consola.success(`${fileName} file copied successfully`)
      })
      consola.log('\n')
    }

    // Replace doc url in documentation.html file if it's laravel
    if (isLaravel) {
      updateFile(
        path.join(tempPkgDir, 'documentation.html'),
        data => data.mustReplace(this.config.documentation.docUrl, this.config.laravel.documentation.docUrl),
      )
    }

    // Generate changelog.html file
    if (!isFree) {
      genRedirectionHtmlFile(
        path.join(tempPkgDir, 'changelog.html'),
        {
          templateFullName: isLaravel ? this.config.laravel.changelog.pageTitle : this.config.changelog.pageTitle,
          url: isLaravel ? this.config.laravel.changelog.url : this.config.changelog.url,
        },
      )
    }

    // Fake sleep
    await new Promise(resolve => setTimeout(resolve, 1))
  }
}
