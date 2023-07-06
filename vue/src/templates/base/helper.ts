import '@/utils/injectMustReplace'
import path from 'path'
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
