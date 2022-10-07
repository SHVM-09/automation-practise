import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import { toCamelCase } from '@/utils/conversions'

export class FillSnippets {
  constructor(private tSFull: string, jSFull: string) {
    console.log(chalk.blueBright(`Assuming you have installed 'node_modules' in '${tSFull}' & '${jSFull}'`))
  }

  /**
   * Returns updated snippet by reading demo code from both TS & JS project
   * @param snippetFilePath Snippet file path of TS Full
   * @returns Updated snippet
   */
  private getUpdatedSnippet(snippetFilePath: string): string {
    // Directory that hold all the snippets. E.g. Alert dir which has all the demos along with code snippet file
    const demosContainerPath = path.join(snippetFilePath, '..')

    const snippetFileName = path.basename(snippetFilePath) // e.g. demoCodeAlert.ts

    // Remove `demoCode` prefix & `.ts` suffix to extract the name. (e.g. demoCodeAlert.ts => Alert)
    // ℹ️ Name will be in pascal case
    const componentName = snippetFileName.slice(8, -3)

    // Get the content of snippet file
    let snippet = fs.readFileSync(snippetFilePath, { encoding: 'utf-8' })

    const demos = globbySync('*.vue', { cwd: demosContainerPath, absolute: true })

    // Loop over all demos and update the snippet
    demos.forEach((demoPath) => {
      // Get the demo variable name from path => export const color = ... <= color is demoVarName name
      const demoVarName = toCamelCase(path.basename(demoPath, '.vue')
      // slice(4) => Remove 'demo' prefix [DemoSwitchTrueAndFalseValue => SwitchTrueAndFalseValue]
      // slice(4 + componentName.length) => Remove component name [SwitchTrueAndFalseValue => TrueAndFalseValue]
        .slice(4 + componentName.length),
      )

      /*
          Returns regex for finding & replacing content for single demo
          Link: https://regex101.com/r/XTWO6x/3
          Groups:
              1st => TS snippet
              2nd => '>' or _might not exist_
              3rd => JS snippet
              4th => '>' or _might not exist_
        */
      const regexToReplaceDemoContent = new RegExp(`export const ${demoVarName} = {(?:\\s|\n)*?ts: [\`'"]{1}((\n|.)*?)[\`'"]{1},(?:\\s|\n)*?js: [\`'"]{1}((\n|.)*?)[\`'"]{1},?(?:\\s|\n)*?}$`, 'gm')

      // Get content of TypeScript demo
      const tSDemo = fs.readFileSync(demoPath, { encoding: 'utf-8' })
        .replace(/`/gi, '\\`')
        .replace(/\$/gi, '\\$')

      // Generate path of JavaScript demo
      const jsDemoPath = demoPath
        .replace('typescript-version', 'javascript-version')
        .replace('.ts', '.js')

      // Get content of JavaScript demo
      const jSDemo = fs.readFileSync(jsDemoPath, { encoding: 'utf-8' })
        .replace(/`/gi, '\\`')
        .replace(/\$/gi, '\\$')

      // Update snippet
      snippet = snippet.replace(
        regexToReplaceDemoContent,
          `export const ${demoVarName} = { ts: \`${tSDemo}\`, js: \`${jSDemo}\` }`,
      )
    })

    return snippet
  }

  /**
   * Fill the code snippets for current project instance
   */
  fillSnippet() {
    console.log(chalk.blueBright('Filling snippets...'))

    // Find snippet all files for TS Full
    const tSSnippetsFilesPaths = globbySync('**/demoCode*', {
      cwd: this.tSFull,
      absolute: true,
    })

    tSSnippetsFilesPaths.forEach((snippetFilePath) => {
      // update snippet file for TS
      const updatedSnippet = this.getUpdatedSnippet(snippetFilePath)

      // Write updated snippet to file - TS Full
      fs.writeFileSync(snippetFilePath, updatedSnippet, { encoding: 'utf-8' })

      // Write updated snippet to file JS Full
      const jSSnippetFilePath = snippetFilePath
        .replace('typescript-version', 'javascript-version')
        .replace('.ts', '.js')

      // Write updated snippet to file - JS Full
      fs.writeFileSync(jSSnippetFilePath, updatedSnippet, { encoding: 'utf-8' })
    })
  }
}