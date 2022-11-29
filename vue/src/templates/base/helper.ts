import path from 'path'
import type { GTMConfig, TemplateBaseConfig } from './config'
import { execCmd, updateFile } from '@/utils/node'
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
    updateFile(
      path.join(projectDir, 'src', 'App.vue'),
      app => app.split('\n')
        .filter(line => !line.includes('BuyNow'))
        .join('\n'),
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
      .replace('<head>', `<head>\n${gtmConfig.headScript}`)
      .replace('<body>', `<body>\n${gtmConfig.bodyNoScript}`),
  )
}

export const getDocsSsrHtmlPath = (templateConfig: TemplateBaseConfig) => path.join(templateConfig.paths.docs, '.vuepress', 'theme', 'templates', 'ssr.html')
