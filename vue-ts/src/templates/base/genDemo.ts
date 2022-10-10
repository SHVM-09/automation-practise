import path from 'path'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import type { TemplateBaseConfig } from './config'
import { info, success } from '@/utils/logging'
import { execCmd, updateFile } from '@/utils/node'

export class GenDemo {
  constructor(private templateConfig: TemplateBaseConfig) {}

  private updateBuildCommand() {
    // Remove vue-tsc from build command in package.json file
    updateFile(
      path.join(this.templateConfig.paths.tSFull, 'package.json'),
      data => data.replace(/&& vue-tsc --noEmit /g, ''),
    )
  }

  private removeExistingBuildData() {
    // Remove dist dir if exist
    fs.removeSync(path.join(this.templateConfig.paths.tSFull, 'dist'))

    // Remove demo dirs
    // TODO: This isn't working
    globbySync('demo-*', {
      cwd: this.templateConfig.paths.tSFull,
      absolute: true,
      deep: 1,
      onlyDirectories: true,
    })
      .forEach((dir) => {
        fs.removeSync(dir)
      })

    // Remove existing zip file
    fs.removeSync(path.join(this.templateConfig.paths.tSFull, 'demos.zip'))
  }

  /**
   * Modifies the files to attach the demo-$number pattern to make all demos unique
   * This is used to isolate the demo config
   * @param demoNumber localStorage key to update for demo
   */
  private updateLocalStorageKeys(demoNumber: number, templateName: string) {
    // default values for demo 1
    let sedFind = '(localStorage.(set|get)Item\\(.*\\.title\\}-)'
    let sedReplace = '\\1demo-1-'
    let indexHTMLFind = new RegExp(`(localStorage.getItem\('${templateName})`, 'g')
    let indexHTMLReplace = '$1-demo-1'

    // If it's not 1st demo update the find replace strings
    if (demoNumber !== 1) {
      const findStr = (() => `demo-${demoNumber - 1}`)()
      const replaceStr = `demo-${demoNumber}`

      sedFind = findStr
      sedReplace = replaceStr

      indexHTMLFind = new RegExp(findStr, 'g')
      indexHTMLReplace = replaceStr
    }

    /*
      Add demo number when mutating localStorage item

      https://stackoverflow.com/a/39382621/10796681
      https://unix.stackexchange.com/a/15309/528729

      Linux command => find ./src \( -iname \*.vue -o -iname \*.ts -o -iname \*.tsx -o -iname \*.js -o -iname \*.jsx \) -type f -exec sed -i "" -r -e "s/(localStorage.(set|get)Item\(.*\.title\}-)/\1demo-1-/g" {} \;
    */
    execCmd(
      `find ./src \\( -iname \\*.vue -o -iname \\*.ts -o -iname \\*.tsx -o -iname \\*.js -o -iname \\*.jsx \\) -type f -exec sed -i "" -r -e "s/${sedFind}/${sedReplace}/g" {} \\;`,
      { cwd: this.templateConfig.paths.tSFull },
    )

    // update index.html as well
    updateFile(
      // Path to `index.html`
      path.join(this.templateConfig.paths.tSFull, 'index.html'),
      data => data.replace(indexHTMLFind, indexHTMLReplace),
    )
  }

  generate(isStaging: boolean) {
    info('isStaging: ', isStaging.toString())

    // Remove existing build files & dirs
    this.removeExistingBuildData()

    info('Updating build command to remove vue-tsc...')
    // Update build command to ignore vue-tsc errors
    this.updateBuildCommand()

    const themeConfigPath = path.join(this.templateConfig.paths.tSFull, 'themeConfig.ts')
    const themeConfig = fs.readFileSync(themeConfigPath, { encoding: 'utf-8' })

    // zip command to zip all the demos after generating them
    let zipCommand = 'zip -r demos.zip'

    // Build demo according to config
    this.templateConfig.demosConfig.forEach((demoConfig, demoIndex) => {
      // Generate demo number
      const demoNumber = demoIndex + 1

      info(`Generating demo ${demoNumber}`)

      info('Updating localStorage keys...')
      this.updateLocalStorageKeys(demoNumber, this.templateConfig.templateName)

      // ℹ️ Demo config can be null if there's no changes in themeConfig
      if (demoConfig) {
        // clone themeConfig
        let demoThemeConfig = themeConfig

        // Loop over demo config and make changes in cloned themeConfig
        demoConfig.forEach((changes) => {
          demoThemeConfig = demoThemeConfig.replace(changes.find, changes.replace)
        })

        // Update themeConfig file
        fs.writeFileSync(themeConfigPath, demoThemeConfig, { encoding: 'utf-8' })
      }

      // Create base path based on demoNumber and env (staging|production)
      const demoDeploymentBase = this.templateConfig.demoDeploymentBase(demoNumber, isStaging)

      // Run build
      execCmd(`yarn build --base=${demoDeploymentBase}`, { cwd: this.templateConfig.paths.tSFull })

      // At the moment of this script execution, we will have "dist" in root the tsFull
      // Rename dist to demo-$demoNumber & all that
      fs.renameSync(
        path.join(this.templateConfig.paths.tSFull, 'dist'),
        path.join(this.templateConfig.paths.tSFull, `demo-${demoNumber}`),
      )

      // Add demo for zipping in zip command
      zipCommand += ` demo-${demoNumber}`

      // Reset the themeConfig
      fs.writeFileSync(themeConfigPath, themeConfig, { encoding: 'utf-8' })

      success(`✅ Demo ${demoNumber} generation completed`)
    })

    info('Creating zip...')
    // Generate demos zip
    execCmd(zipCommand, { cwd: this.templateConfig.paths.tSFull })

    // Reset changes we done via git checkout
    // Thanks: https://stackoverflow.com/a/21213235/10796681
    execCmd('git status >/dev/null 2>&1 && git checkout .', { cwd: this.templateConfig.paths.tSFull })
  }
}
