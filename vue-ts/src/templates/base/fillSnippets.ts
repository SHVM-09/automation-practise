import { toCamelCase } from "@/utils/conversions";
import { fs, globby, path } from "zx";

export type OnSnippetUpdateCallback = (updatedSnippet: string, snippetFilePath: string) => void

export class FillSnippets {
  projectSrcPath: string

  constructor(public projectPath:string) {
    this.projectSrcPath = path.join(projectPath, 'src')
  }

  /**
   * Update all the demo snippets in provided file by scrapping all the demos in the same dir as snippet file
   * @param snippetFilePath Snippet file path
   * @returns Promise object represents updated code snippet string
   */
  async updateSnippet(snippetFilePath: string): Promise<string> {
    
      // Directory that hold all the snippets. E.g. Alert dir which has all the demos along with code snippet file
      const demosContainerPath = path.join(snippetFilePath, '..')

      const snippetFileName = path.basename(snippetFilePath)

      const shallReplaceTs = path.extname(snippetFileName) === '.ts'

      // Remove `demoCode` prefix & `.ts` suffix to extract the name. (e.g. demoCodeAlert.ts => Alert)
      // ℹ️ Name will be in pascal case
      const componentName = snippetFileName.slice(8,-3)

      // Get the content of snippet file
      let snippet = fs.readFileSync(snippetFilePath, { encoding: 'utf-8' })

      const demos = await globby('*.vue', { cwd: demosContainerPath, absolute: true })
      
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
          shallReplaceTs
            ? `export const ${demoVarName} = { ts: \`${demo}\`, js: '' }`
            : `export const ${demoVarName} = { ts: \`$1\`, js: \`${demo}\` }`
        )

      })

      return snippet     
  }

  /**
   * Fill the code snippets for current project instance
   * @param onSnippetUpdate Callback function to run when snippet file is updated
   */
  async fillSnippet(onSnippetUpdate?: OnSnippetUpdateCallback) {

    // Find snippet all files
    const snippetsFilesPaths = await globby('**/demoCode*', {
      cwd: this.projectSrcPath,
      absolute: true,
    })


    snippetsFilesPaths.forEach(async (snippetFilePath: string) => {
      const updatedSnippet = await this.updateSnippet(snippetFilePath)

      // Write updated snippet to file
      fs.writeFileSync(snippetFilePath, updatedSnippet, { encoding: 'utf-8' })
      
      onSnippetUpdate && onSnippetUpdate(updatedSnippet, snippetFilePath)
    })
  }
}
