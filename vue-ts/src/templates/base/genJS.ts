import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import JSON5 from 'json5'
import type { TemplateBaseConfig } from './config'
import { TempLocation } from '@/utils/temp'
import { SFCCompiler } from '@/sfcCompiler'

export class GenJS {
  // private projectSrcPath: string
  private tempDir: string

  constructor(private templateConfig: TemplateBaseConfig) {
    // this.projectSrcPath = path.join(templateConfig.projectPath, 'src')
    this.tempDir = new TempLocation().tempDir
  }

  // 👉 genProjectCopyCommand
  private genProjectCopyCommand(): string {
    let command = `rsync -av --progress ${this.templateConfig.paths.tSFull}/ ${this.tempDir} `
    this.templateConfig.packageCopyIgnorePatterns.forEach((pattern) => {
      // We need to escape the * when using rsync
      command += `--exclude ${pattern.replace('*', '\\*')} `
    })

    return command
  }

  // 👉 copyTSFullToTempDir
  private copyTSFullToTempDir() {
    console.log(`Copying to ${this.tempDir}`)

    const commandToCopyProject = this.genProjectCopyCommand()

    execSync(commandToCopyProject)
  }

  // 👉 updateViteConfig
  private updateViteConfig() {
    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')

    let viteConfig = fs.readFileSync(viteConfigPath, { encoding: 'utf-8' })

    // Replace themeConfig.ts alias to themeConfig.js
    viteConfig = viteConfig.replace('themeConfig.ts', 'themeConfig.js')

    // enable eslintrc in AutoImport plugin
    const autoImportEslintConfig = `eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
    },`

    viteConfig = viteConfig.replace(/(AutoImport\({\n(\s+))/, `$1${autoImportEslintConfig}\n$2`)

    fs.writeFileSync(viteConfigPath, viteConfig, { encoding: 'utf-8' })
  }

  // 👉 removeEslintInternalRules
  private removeEslintInternalRules() {
    // Remove eslint internal rules dir
    fs.removeSync(
      path.join(this.tempDir, 'eslint-internal-rules'),
    )

    // Remove eslint internal rules from vscode config
    const vsCodeConfigPath = path.join(this.tempDir, '.vscode', 'settings.json')

    // Read config file as string as pass to json5 `parse` method
    const vsCodeConfig = JSON5.parse(
      fs.readFileSync(vsCodeConfigPath, { encoding: 'utf-8' }),
    )

    // Remove `rulePaths` from eslint options in config file
    // ℹ️ `eslint.options` is single key
    delete vsCodeConfig['eslint.options'].rulePaths

    // Write back to config file
    fs.writeJsonSync(vsCodeConfigPath, vsCodeConfig, { spaces: 4 })
  }

  // 👉 updateEslintConfig
  private updateEslintConfig() {
    const eslintConfigPath = path.join(this.tempDir, '.eslintrc.js')
    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')

    // Add import resolver package
    execSync('yarn add eslint-import-resolver-alias', { cwd: this.tempDir })

    // Read eslint config
    let eslintConfig = fs.readFileSync(eslintConfigPath, { encoding: 'utf-8' })

    /*
      Remove all the lines which contains word 'typescript' or 'antfu'
      ℹ️ We will remove line that contains word 'antfu' => We need to remove antfu eslint config as this also add TS rules
    */
    eslintConfig = eslintConfig.split('\n')
      .filter(line => !(line.includes('typescript') || line.includes('antfu')))
      .join('\n')

    // Remove eslint internal rules
    eslintConfig = eslintConfig.replace(/(\s+\/\/ Internal Rules|\s+'valid-appcardcode.*)/g, '')

    /*
      Add auto-import json file in extends array
      Regex: https://regex101.com/r/1RYdYv/2
    */
    eslintConfig = eslintConfig.replace(/(extends: \[\n(\s+))/g, '$1\'.eslintrc-auto-import.json\',\n$2')

    // Add vite aliases in eslint import config
    const viteConfig = fs.readFileSync(viteConfigPath, { encoding: 'utf-8' })
    const importAliases = viteConfig.matchAll(/'(?<alias>.*)': fileURLToPath\(new URL\('(?<path>.*)',.*,/g)
    const importAliasesEslintConfig = `alias: {'extensions': ['.ts', '.js', '.tsx', '.jsx', '.mjs'], 'map': ${JSON.stringify([...importAliases].map(m => m.groups && Object.values(m.groups)))}}`

    eslintConfig = eslintConfig.replace(/(module\.exports = {(\n|.)*\s{6}},)((\n|.)*)/g, `$1${importAliasesEslintConfig}$3`)

    fs.writeFileSync(eslintConfigPath, eslintConfig, { encoding: 'utf-8' })
  }

  // 👉 updateTSConfig
  private updateTSConfig() {
    // Path to tsconfig.json
    const tsConfigPath = path.join(this.tempDir, 'tsconfig.json')

    // read tsconfig
    const tsConfig = fs.readJsonSync(tsConfigPath)

    // Disable source map
    tsConfig.compilerOptions.sourceMap = false

    // Write back to tsconfig
    fs.writeJsonSync(tsConfigPath, tsConfig, { spaces: 4 })
  }

  private removeAllTSFile() {
    // Remove all TypeScript files
    const tSFiles = globbySync(['**/*.ts', '**/*.tsx', '!node_modules'], { cwd: this.tempDir, absolute: true })

    tSFiles.forEach(f => fs.removeSync(f))
  }

  private compileSFCs() {
    const sFCCompiler = new SFCCompiler()

    // Collect all the SFCs
    const sFCPaths = globbySync('**/*.vue', { cwd: this.tempDir, absolute: true })

    // Compile all SFCs
    sFCPaths.forEach((sFCPath) => {
      // Read SFC
      const sFC = fs.readFileSync(sFCPath, { encoding: 'utf-8' })

      // Compile SFC's script block
      const compiledSFCScript = sFCCompiler.compileSFCScript(sFC)

      /*
        If compiledSFCScript is string => It is compiled => Write compiled SFC script block back to SFC
        else it's undefined => There's no script block => No compilation => Don't touch the file
      */
      if (compiledSFCScript) {
        const compiledSfc = sFC.replace(/<script.*>(?:\n|.)*<\/script>/, compiledSFCScript.trim())
        fs.writeFileSync(sFCPath, compiledSfc, { encoding: 'utf-8' })
      }
    })
  }

  // 👉 updatePkgJson
  private updatePkgJson() {
    // Path to package.json
    const pkgJsonPath = path.join(this.tempDir, 'package.json')

    // Read package.json
    const pkgJson = fs.readJsonSync(pkgJsonPath)

    // Remove "typecheck" script
    delete pkgJson.scripts.typecheck

    // Update build:icons script
    pkgJson.scripts['build:icons'] = 'node src/@iconify/build-icons.js'

    // Remove vue-tsc --noEmit & ` --rulesdir eslint-internal-rules/` from all scripts
    pkgJson.scripts = Object.fromEntries(
      Object.entries<string>(pkgJson.scripts).map(([scriptName, script]) => {
        return [
          scriptName,
          script.replace(/( --rulesdir eslint-internal-rules\/|vue-tsc --noEmit && | && vue-tsc --noEmit)/, ''),
        ]
      }),
    )

    // Remove TypeScript related packages => Remove all the devDependencies that contains "type" word
    pkgJson.devDependencies = Object.fromEntries(
      Object.entries(pkgJson.devDependencies).filter(([dep, _]) => !dep.includes('type')),
    )

    // Write updated json to file
    fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 4 })
  }

  // 👉 updateIndexHtml
  private updateIndexHtml() {
    // Path to `index.html`
    const indexHTMLPath = path.join(this.tempDir, 'index.html')

    // Read index file
    let indexHTML = fs.readFileSync(indexHTMLPath, { encoding: 'utf-8' })

    // Replace `main.ts` with `main.js`
    indexHTML = indexHTML.replace('main.ts', 'main.js')

    // Write back to index file
    fs.writeFileSync(indexHTMLPath, indexHTML, { encoding: 'utf-8' })
  }

  /**
   * Generate `jsconfig.json` from `tsconfig.json` file for vscode
   */
  // 👉 genJSConfig
  private genJSConfig() {
    // Path to tsconfig.json
    const tsConfigPath = path.join(this.tempDir, 'tsconfig.json')

    /*
      Read tsconfig
      ℹ️ We will read as text instead of JSON => It's easy to find & replace .ts extension with .js on whole string
    */
    let tsConfig = fs.readFileSync(tsConfigPath, { encoding: 'utf-8' })

    // ❗ This isn't working => ts => js

    // Replace `.ts` extensions with `.js` extension
    tsConfig = tsConfig.replace('.ts', '.js')

    // Parse modified tsConfig as JSON
    const tsConfigJSON = JSON5.parse(tsConfig)

    // Compiler options to add in jsConfig
    const jsConfigCompilerOptions = [
      'noLib',
      'target',
      'module',
      'moduleResolution',
      'checkJs',
      'experimentalDecorators',
      'allowSyntheticDefaultImports',
      'baseUrl',
      'paths',
      'jsx',
      'types',
    ]

    const jsConfig = {
      // TODO: We aren't excluding shims.d.ts file as well
      include: (tsConfigJSON.include as string[]).filter(i => i !== 'env.d.ts'),
      exclude: tsConfigJSON.exclude,
      compilerOptions: Object.fromEntries(
        Object.entries(tsConfigJSON.compilerOptions)
          .filter(([p, _]) => jsConfigCompilerOptions.includes(p)),
      ),
    }

    // Path to jsConfig
    const jsConfigPath = path.join(this.tempDir, 'jsconfig.json')

    // Write back to jsConfig as JSON
    fs.writeJsonSync(jsConfigPath, jsConfig, { spaces: 4 })
  }

  // 👉 updateGitIgnore
  private updateGitIgnore() {
    // Path to `.gitignore`
    const gitIgnorePath = path.join(this.tempDir, '.gitignore')

    // Read `.gitignore` file
    let gitIgnore = fs.readFileSync(gitIgnorePath, { encoding: 'utf-8' })

    // Remove all the lines that contains iconify word
    gitIgnore = gitIgnore.split('\n')
      .filter(line => !line.includes('iconify'))
      .join('\n')

    // Write back to gitIgnore file
    fs.writeFileSync(gitIgnorePath, gitIgnore, { encoding: 'utf-8' })
  }

  // 👉 replaceJSFullVersion
  private replaceJSFullVersion() {
    fs.moveSync(this.tempDir, this.templateConfig.paths.jSFull, { overwrite: true })
  }

  // 👉 genJS
  genJS() {
    // Copy project to temp dir
    this.copyTSFullToTempDir()

    // Update vite config
    this.updateViteConfig()

    /*
      update eslint
      ❗Run this method after updating viteConfig
        Because we modifies the alias extension in viteConfig which is inserted in this method
    */
    this.updateEslintConfig()

    // Remove eslintInternal rules
    this.removeEslintInternalRules()

    /*
      ℹ️ Now we will generate the js & jsx files from ts & tsx files
      But for this we need some changes in our jsconfig file:
        1. Disable source maps
    */
    this.updateTSConfig()

    /*
      Install packages
      ℹ️ We need this to run tsc & generate build
    */
    execSync('yarn', { cwd: this.tempDir })

    // ❗ Generate build-icons.js before running tsc
    execSync('yarn build:icons', { cwd: this.tempDir })

    // Run `tsc` to compile TypeScript files
    execSync('yarn tsc', { cwd: this.tempDir })

    // Remove all TypeScript files
    this.removeAllTSFile()

    // Compile all SFCs written using TS to SFC JS
    this.compileSFCs()

    this.updatePkgJson()

    this.updateIndexHtml()

    // create [jsconfig.json](https://code.visualstudio.com/docs/languages/jsconfig) for vscode
    this.genJSConfig()

    // Remove iconify js files from gitignore
    this.updateGitIgnore()

    /*
      Run build command
      ℹ️ We need to run build command to generate some `d.ts` files for antfu's vite plugins
      This will mitigate the ESLint errors in next step where we run eslint to auto format the code
    */
    execSync('yarn build', { cwd: this.tempDir })

    /*
      Remove typescript eslint comments from tsx/ts files
      grep -r "@typescript-eslint" ./src | cut -d: -f1

      https://stackoverflow.com/a/39382621/10796681
      https://unix.stackexchange.com/a/15309/528729
    */
    execSync('find ./src \\( -iname \\*.vue -o -iname \\*.js -o -iname \\*.jsx \\) -type f | xargs sed -i \'\' -e \'/@typescript-eslint/d;/@ts-expect/d\'', { cwd: this.tempDir })

    // Auto format all files using eslint
    execSync('yarn lint', { cwd: this.tempDir })

    // Place temp dir content in js full version
    this.replaceJSFullVersion()
  }
}
