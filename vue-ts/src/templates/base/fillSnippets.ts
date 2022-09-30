import { toCamelCase } from "@/utils/conversions";
import chalk from "chalk";
import fs from 'fs-extra';
import { globbySync } from 'globby';
import path from 'path';

export type OnSnippetUpdateCallback = (updatedSnippet: string, snippetFilePath: string) => void

export class FillSnippets {
  private projectSrcPath: string

  constructor(projectPath: string) {

    console.log(chalk.blueBright(`Assuming you have installed 'node_modules' in '${projectPath}'`));

    this.projectSrcPath = path.join(projectPath, 'src')
  }

  /**
   * Update all the demo snippets in provided file by scrapping all the demos in the same dir as snippet file
   * @param snippetFilePath Snippet file path
   * @returns Promise object represents updated code snippet string
   */
  private getUpdatedSnippet(snippetFilePath: string): string {
    
      // Directory that hold all the snippets. E.g. Alert dir which has all the demos along with code snippet file
      const demosContainerPath = path.join(snippetFilePath, '..')

      const snippetFileName = path.basename(snippetFilePath)

      const shallUpdateTSSnippet = path.extname(snippetFileName) === '.ts'

      // Remove `demoCode` prefix & `.ts` suffix to extract the name. (e.g. demoCodeAlert.ts => Alert)
      // ℹ️ Name will be in pascal case
      const componentName = snippetFileName.slice(8,-3)

      // Get the content of snippet file
      let snippet = fs.readFileSync(snippetFilePath, { encoding: 'utf-8' })

      const demos = globbySync('*.vue', { cwd: demosContainerPath, absolute: true })
      
      // Loop over all demos and update the snippet
      demos.forEach(demoPath => {
        const demo = fs.readFileSync(demoPath, { encoding: 'utf-8' })
          .replace(/`/gi, '\\`')
          .replace(/\$/gi, '\\$')

        
        const demoVarName = toCamelCase(path.basename(demoPath, '.vue')
          // slice(4) => Remove 'demo' prefix [DemoSwitchTrueAndFalseValue => SwitchTrueAndFalseValue]
          // slice(4 + componentName.length) => Remove component name [SwitchTrueAndFalseValue => TrueAndFalseValue]
          .slice(4 + componentName.length)
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

        snippet = snippet.replace(
          regexToReplaceDemoContent,
          // If we are updating TS snippet => Only update TS snippet, keep JS snippet as it is in TS Version
          // If we are updating JS snippet => Update Both TS & JS snippets in JS version (TS version will be updated using callback)
          shallUpdateTSSnippet
            ? `export const ${demoVarName} = { ts: \`${demo}\`, js: \`$3\` }`
            : `export const ${demoVarName} = { ts: \`$1\`, js: \`${demo}\` }`
        )

      })

      return snippet     
  }

  /**
   * Fill the code snippets for current project instance
   */
  fillSnippet() {

    console.log(chalk.blueBright('Filling snippets...'));

    // Find snippet all files
    const snippetsFilesPaths = globbySync('**/demoCode*', {
      cwd: this.projectSrcPath,
      absolute: true,
    })

    // ❗ How we will write for snippet of another project

    snippetsFilesPaths.forEach(snippetFilePath => {

      // update snippet file
      const updatedSnippet = this.getUpdatedSnippet(snippetFilePath);

      // Write updated snippet to file
      fs.writeFileSync(snippetFilePath, updatedSnippet, { encoding: 'utf-8' });
    })
  }
}
