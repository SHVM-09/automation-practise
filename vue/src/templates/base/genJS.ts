import path from 'path'

import fs from 'fs-extra'
import { globbySync } from 'globby'
import JSON5 from 'json5'
import { loadFile, writeFile } from 'magicast'
import { updateVitePluginConfig } from 'magicast/helpers'
import type { PackageJson } from 'type-fest'

import type { TemplateBaseConfig } from './config'
import { SFCCompiler } from '@/sfcCompiler'
import { Utils } from '@/templates/base/helper'
import '@/utils/injectMustReplace'
import { error } from '@/utils/logging'
import { execCmd, replaceDir, updateFile } from '@/utils/node'

export class GenJS extends Utils {
  constructor(private templateConfig: TemplateBaseConfig, private isSK: boolean = false, private isFree: boolean = false) {
    super()
  }

  // 👉 updateViteConfig
  private async updateViteConfig() {
    // updateFile(
    //   path.join(this.tempDir, 'vite.config.ts'),
    //   (viteConfig) => {
    //     // Replace themeConfig.ts alias to themeConfig.js
    // viteConfig = viteConfig[this.isFree ? 'replace' : 'mustReplace']('themeConfig.ts', 'themeConfig.js')

    //     // enable eslintrc in AutoImport plugin
    //     const autoImportEslintConfig = `eslintrc: {
    //         enabled: true,
    //         filepath: './.eslintrc-auto-import.json',
    //     },`

    //     return viteConfig.mustReplace(/(AutoImport\({\n(\s+))/g, `$1${autoImportEslintConfig}\n$2`)
    //   },
    // )

    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')

    // Replace themeConfig.ts alias to themeConfig.js
    updateFile(viteConfigPath, (viteConfig) => {
      viteConfig = viteConfig[this.isFree ? 'replace' : 'mustReplace']('themeConfig.ts', 'themeConfig.js')
      return viteConfig
    })

    const mod = await loadFile(viteConfigPath)

    // enable eslintrc in AutoImport plugin
    updateVitePluginConfig(mod, 'unplugin-auto-import/vite', {
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    })

    await writeFile(mod.$ast, viteConfigPath, {
      quote: 'single',
      useTabs: true,
      trailingComma: true,
    })
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
    if ('eslint.options' in vsCodeConfig)
      delete vsCodeConfig['eslint.options'].rulePaths

    // Write back to config file
    fs.writeJsonSync(vsCodeConfigPath, vsCodeConfig, { spaces: 2 })
  }

  // 👉 updateEslintConfig
  private updateEslintConfig() {
    const eslintConfigPath = path.join(this.tempDir, '.eslintrc.js')
    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')

    // Add import resolver package
    execCmd('yarn add eslint-import-resolver-alias', { cwd: this.tempDir })

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
    eslintConfig = eslintConfig.mustReplace(/(\s+\/\/ Internal Rules|\s+'valid-appcardcode.*)/g, '')

    // Remove `*.d.ts` from ignorePatterns
    eslintConfig = eslintConfig.mustReplace(/(?<=ignorePatterns.*), '\*.d.ts'/g, '')

    // Replace .ts extension with .js
    eslintConfig = eslintConfig.replaceAll('.ts', '.js')

    /*
      Add auto-import json file in extends array
      Regex: https://regex101.com/r/1RYdYv/2
    */
    eslintConfig = eslintConfig.mustReplace(/(extends: \[\n(\s+))/g, '$1\'.eslintrc-auto-import.json\',\n$2')

    // Add vite aliases in eslint import config
    const viteConfig = fs.readFileSync(viteConfigPath, { encoding: 'utf-8' })
    const importAliases = viteConfig.matchAll(/'(?<alias>.*)': fileURLToPath\(new URL\('(?<path>.*)',.*,/g)
    const importAliasesEslintConfig = `alias: {'extensions': ['.ts', '.js', '.tsx', '.jsx', '.mjs'], 'map': ${JSON.stringify([...importAliases].map(m => m.groups && Object.values(m.groups)))}}`

    eslintConfig = eslintConfig.mustReplace(/(module\.exports = {(\n|.)*\s{6}},)((\n|.)*)/g, `$1${importAliasesEslintConfig}$3`)

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
    fs.writeJsonSync(tsConfigPath, tsConfig, { spaces: 2 })
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
        const compiledSfc = sFC.mustReplace(/<script.*>(?:\n|.)*<\/script>/g, compiledSFCScript.trim())
        fs.writeFileSync(sFCPath, compiledSfc, { encoding: 'utf-8' })
      }
    })
  }

  // 👉 updatePkgJson
  private updatePkgJson() {
    // Path to package.json
    const pkgJsonPath = path.join(this.tempDir, 'package.json')

    // Read package.json
    const pkgJson: PackageJson = fs.readJsonSync(pkgJsonPath)

    // Remove "typecheck" script
    if (!pkgJson.scripts) {
      error('No scripts found in package.json')
      return
    }

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

    if (!pkgJson.devDependencies) {
      error('No devDependencies found in package.json')
      return
    }

    // Remove TypeScript related packages => Remove all the devDependencies that contains "type" word and "vue-tsc"
    pkgJson.devDependencies = Object.fromEntries(
      Object.entries(pkgJson.devDependencies).filter(([dep, _]) => !(dep.includes('type') || dep.includes('vue-tsc'))),
    )

    // Write updated json to file
    fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 })
  }

  // 👉 updateIndexHtml
  private updateIndexHtml() {
    updateFile(
      path.join(this.tempDir, 'index.html'),
      indexHTML => indexHTML.mustReplace('main.ts', 'main.js'),
    )
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
    tsConfig = tsConfig.mustReplace('.ts', '.js')

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

    // ℹ️ Don't include d.ts files
    const jsConfigInclude = (tsConfigJSON.include as string[]).filter(i => !i.endsWith('d.ts'))

    // Change extension from .ts to .js except files that have double dots or dashes
    jsConfigInclude.forEach((i, index) => {
      jsConfigInclude[index] = i.replace(/(?<=^\w+.)ts/gm, 'js')
    })

    const jsConfig = {
      include: jsConfigInclude,
      exclude: tsConfigJSON.exclude,
      compilerOptions: Object.fromEntries(
        Object.entries(tsConfigJSON.compilerOptions)
          .filter(([p, _]) => jsConfigCompilerOptions.includes(p)),
      ),
    }

    // Path to jsConfig
    const jsConfigPath = path.join(this.tempDir, 'jsconfig.json')

    // Write back to jsConfig as JSON
    fs.writeJsonSync(jsConfigPath, jsConfig, { spaces: 2 })

    // remove tsConfig
    fs.removeSync(tsConfigPath)
  }

  // 👉 updateGitIgnore
  private updateGitIgnore() {
    updateFile(
      path.join(this.tempDir, '.gitignore'),

      // replace: src/@iconify/*.js => src/@iconify/icons-bundle.js
      gitIgnore => gitIgnore.mustReplace(/(?<=.*@iconify\/)\*\.js/gm, 'icons-bundle.js'),
    )
  }

  // 👉 genJS
  async genJS() {
    const {
      tSFull: tSFullPath,
      tSStarter: tSStarterPath,
      jSFull: jSFullPath,
      jSStarter: jSStarterPath,
      freeTS: freeTSPath,
      freeJS: freeJSPath,
    } = this.templateConfig.paths

    const source = (() => {
      // If generating JS of free version => copy from free version TS
      if (this.isFree)
        return freeTSPath

      // If it's starter-kit => Copy from Starter TS
      if (this.isSK)
        return tSStarterPath

      // If both free & sk isn't true use Full version's TS
      return tSFullPath
    })()

    // Copy project to temp dir
    this.copyProject(
      source,
      this.tempDir,

      /*
        ℹ️ Don't include env & shims file because those are TS only files.
        We will copy components.d.ts & auto-imports.d.ts for "yarn tsc" to run without errors
      */
      [
        ...this.templateConfig.packageCopyIgnorePatterns,
        '**/test**',
      ],
    )

    // Update vite config
    await this.updateViteConfig()

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
    execCmd('yarn', { cwd: this.tempDir })

    // ❗ Generate build-icons.js before running tsc
    execCmd('yarn build:icons', { cwd: this.tempDir })

    // Run `tsc` to compile TypeScript files
    execCmd('yarn tsc', { cwd: this.tempDir })

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
    execCmd('yarn build', { cwd: this.tempDir })

    /*
      Remove typescript eslint comments from tsx/ts files
      grep -r "@typescript-eslint" ./src | cut -d: -f1

      https://stackoverflow.com/a/39382621/10796681
      https://unix.stackexchange.com/a/15309/528729
    */
    // ❗ As `sed` command work differently on mac & ubuntu we need to add empty quotes after -i on mac
    execCmd(`find ./src \\( -iname \\*.vue -o -iname \\*.js -o -iname \\*.jsx \\) -type f | xargs sed -i ${process.platform === 'darwin' ? '""' : ''} -e '/@typescript-eslint/d;/@ts-expect/d'`, { cwd: this.tempDir })

    // ℹ️ Remove d.ts files from JS project
    // ℹ️ We need to remove all d.ts files before we run `yarn lint` because we are removing d.ts from ignore in `updateEslintConfig` method
    const dTsFiles = globbySync(['*.d.ts'], { cwd: this.tempDir, absolute: true })
    dTsFiles.forEach(f => fs.removeSync(f))

    // Auto format all files using eslint
    execCmd('yarn lint', { cwd: this.tempDir })

    const replaceDest = (() => {
      // If generating JS for free version => Replace with free JS
      if (this.isFree)
        return freeJSPath

      // If generating SK JS => Replace with JS Starter
      if (this.isSK)
        return jSStarterPath

      // If both free & sk isn't true use Full version's JS as replace destination
      return jSFullPath
    })()

    // Place temp dir content in js full version
    replaceDir(this.tempDir, replaceDest)
  }
}
