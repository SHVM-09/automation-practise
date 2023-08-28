import '@/utils/injectMustReplace'
import path from 'path'
import fs from 'fs-extra'
import JSON5 from 'json5'
import type { GTMConfig, TemplateBaseConfig } from './config'
import { execCmd, filterFileByLine, updateFile } from '@/utils/node'
import { TempLocation } from '@/utils/temp'

export class Utils {
  protected tempDir: string

  constructor() {
    this.tempDir = new TempLocation().tempDir
  }

  private genProjectCopyCommand(src: string, dest: string, ignorePatterns: string[]): string {
    let command = `rsync -av --progress ${src}/ ${dest} `
    ignorePatterns.forEach((pattern) => {
      // We need to escape the * when using rsync
      command += `--exclude ${pattern.replace('*', '\\*')} `
    })

    return command
  }

  protected copyProject(src: string, dest: string, ignorePatterns: string[] = []) {
    const commandToCopyProject = this.genProjectCopyCommand(src, dest, ignorePatterns)

    execCmd(commandToCopyProject)
  }

  protected removeBuyNow(projectDir: string) {
    filterFileByLine(
      path.join(projectDir, 'src', 'components', 'BuyNow.vue'),
      line => !line.includes('BuyNow'),
    )
  }

  protected removeEslintInternalRules(projectDir: string) {
    // Remove eslint internal rules dir
    fs.removeSync(
      path.join(projectDir, 'eslint-internal-rules'),
    )

    // Remove eslint internal rules from vscode config
    const vsCodeConfigPath = path.join(projectDir, '.vscode', 'settings.json')

    // Read config file as string as pass to json5 `parse` method
    const vsCodeConfig = JSON5.parse(
      fs.readFileSync(vsCodeConfigPath, { encoding: 'utf-8' }),
    )

    // Remove `rulePaths` from eslint options in config file
    // ℹ️ `eslint.options` is single key
    if ('eslint.options' in vsCodeConfig)
      delete vsCodeConfig['eslint.options'].rulePaths

    // Write back to config file
    fs.writeJsonSync(vsCodeConfigPath, vsCodeConfig, { spaces: 2 })

    // Remove from eslint config
    updateFile(
      path.join(projectDir, '.eslintrc.js'),
      data => data
        .mustReplace(/(\s+\/\/ Internal Rules|\s+'valid-appcardcode.*)/g, ''),
    )

    // Update package.json to remove eslint internal rules
    updateFile(
      path.join(projectDir, 'package.json'),
      data => data.mustReplace(' --rulesdir eslint-internal-rules/', ''),
    )
  }
}

export const injectGTM = (filePath: string, gtmConfig: GTMConfig) => {
  /*
      ℹ️ headScript should be as high as possible inside head tag
      ℹ️ bodyNoScript should be placed immediately after opening body tag
    */

  updateFile(
    // Path to `index.html`
    filePath,
    htmlContent => htmlContent
      .mustReplace('<head>', `<head>\n${gtmConfig.headScript}`)
      .mustReplace('<body>', `<body>\n${gtmConfig.bodyNoScript}`),
  )
}

export const injectGTMInVitePress = (vitePressConfigPath: string, gtmConfig: GTMConfig) => {
  /*
    ℹ️ headScript should be as high as possible inside head tag
    ℹ️ bodyNoScript should be placed immediately after opening body tag
  */
  updateFile(
    vitePressConfigPath,
    content => content
      .mustReplace('headScript: ``', `headScript: \`${gtmConfig.headScript}\``)
      .mustReplace('bodyNoScript: ``', `bodyNoScript: \`${gtmConfig.bodyNoScript}\``),
  )
}

export const getDocsConfigPath = (templateConfig: TemplateBaseConfig) => path.join(templateConfig.paths.docs, '.vitepress', 'config.ts')
