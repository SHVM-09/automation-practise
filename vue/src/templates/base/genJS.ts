import path from 'node:path'

import fs from 'fs-extra'
import { globbySync } from 'globby'
import JSON5 from 'json5'
import { loadFile, writeFile } from 'magicast'
import { updateVitePluginConfig } from 'magicast/helpers'
import type { PackageJson } from 'type-fest'

import { consola } from 'consola'
import type { TemplateBaseConfig } from './config'
import { SFCCompiler } from '@/sfcCompiler'
import { Utils } from '@/templates/base/helper'
import '@/utils/injectMustReplace'
import { execCmd, filterFileByLine, readFileSyncUTF8, replaceDir, updateFile } from '@/utils/node'

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
      trailingComma: true,
    })
  }

  // 👉 updateEslintConfig
  private updateEslintConfig() {
    const eslintConfigPath = path.join(this.tempDir, '.eslintrc.js')
    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')

    // Add import resolver package
    execCmd('pnpm add eslint-import-resolver-alias', { cwd: this.tempDir })

    /*
      Remove all the lines which contains word 'typescript' or 'antfu'
      ℹ️ We will remove line that contains word 'antfu' => We need to remove antfu eslint config as this also add TS rules
    */
    filterFileByLine(
      eslintConfigPath,
      line => !(
        line.includes('typescript') || line.includes('antfu')
      ),
    )

    // ❗ It's important to read after filtering the file because we are removing some lines
    // Read eslint config
    let eslintConfig = readFileSyncUTF8(eslintConfigPath)

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
    const importAliasesStr = JSON.stringify([...importAliases].map(m => m.groups && Object.values(m.groups)))
      .mustReplace(/],\s?\[/gm, '],\n[')
      .mustReplace(/\[\[/gm, '[\n[')
      .mustReplace(']]', ']\n]')

    const importAliasesEslintConfig = `alias: {
      'extensions': [
        '.ts',
        '.js',
        '.tsx',
        '.jsx',
        '.mjs'
      ],
      'map': ${importAliasesStr}
    }`

    eslintConfig = eslintConfig.mustReplace(/(node:.*\n.*extensions.*\n.*)/gm, `$1\n${importAliasesEslintConfig}`)

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
    globbySync(
      [
        '**/*.ts',
        '**/*.tsx',
        '**/*.d.ts',
        '!node_modules',
      ],
      {
        cwd: this.tempDir,
        absolute: true,
      },
    )
      .forEach(fs.removeSync)
  }

  private async compileSFCs() {
    const sFCCompiler = new SFCCompiler()

    // Collect all the SFCs
    const sFCPaths = globbySync('**/*.vue', { cwd: this.tempDir, absolute: true })

    // Compile all SFCs
    await Promise.all(
      sFCPaths.map(async (sFCPath) => {
      // Read SFC
        const sFC = readFileSyncUTF8(sFCPath)

        // Compile SFC's script block
        const compiledSFCScript = await sFCCompiler.compileSFCScript(sFC)

        /*
        If compiledSFCScript is string => It is compiled => Write compiled SFC script block back to SFC
        else it's undefined => There's no script block => No compilation => Don't touch the file
      */
        if (compiledSFCScript) {
          const compiledSfc = sFC.mustReplace(/<script.*>(?:\n|.)*<\/script>/g, compiledSFCScript.trim())
          fs.writeFileSync(sFCPath, compiledSfc, { encoding: 'utf-8' })
        }
      }),
    )
  }

  // 👉 updatePkgJson
  private updatePkgJson() {
    // Path to package.json
    const pkgJsonPath = path.join(this.tempDir, 'package.json')

    // Read package.json
    const pkgJson: PackageJson = fs.readJsonSync(pkgJsonPath)

    // Remove "typecheck" script
    if (!pkgJson.scripts) {
      consola.error(new Error('No scripts found in package.json'))
      return
    }

    delete pkgJson.scripts.typecheck
    // Update build:icons script
    pkgJson.scripts['build:icons'] = 'tsx src/plugins/iconify/build-icons.js'

    // Remove vue-tsc --noEmit & ` --rulesdir eslint-internal-rules/` from all scripts
    pkgJson.scripts = Object.fromEntries(
      Object.entries<string>(pkgJson.scripts).map(([scriptName, script]) => {
        return [
          scriptName,
          script.replace(/(vue-tsc --noEmit && | && vue-tsc --noEmit)/, ''),
        ]
      }),
    )

    if (!pkgJson.devDependencies) {
      consola.error(new Error('No devDependencies found in package.json'))
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
        We will copy components.d.ts & auto-imports.d.ts for "pnpm tsc" to run without errors
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
    this.removeEslintInternalRules(this.tempDir)

    /*
      ℹ️ Now we will generate the js & jsx files from ts & tsx files
      But for this we need some changes in our jsconfig file:
        1. Disable source maps
    */
    this.updateTSConfig()

    // Install packages & Run `tsc` to compile TypeScript files
    execCmd('pnpm install && pnpm tsc', { cwd: this.tempDir })

    // Remove all TypeScript files
    this.removeAllTSFile()

    // Compile all SFCs written using TS to SFC JS
    await this.compileSFCs()

    this.updatePkgJson()

    this.updateIndexHtml()

    // create [jsconfig.json](https://code.visualstudio.com/docs/languages/jsconfig) for vscode
    this.genJSConfig()

    /*
      Run build command
      ℹ️ We need to run build command to generate some `d.ts` files for antfu's vite plugins
      This will mitigate the ESLint errors in next step where we run eslint to auto format the code
    */
    execCmd('pnpm build', { cwd: this.tempDir })

    /*
      Remove typescript eslint comments from tsx/ts files
      grep -r "@typescript-eslint" ./src | cut -d: -f1

      https://stackoverflow.com/a/39382621/10796681
      https://unix.stackexchange.com/a/15309/528729
    */
    // ❗ As `sed` command work differently on mac & ubuntu we need to add empty quotes after -i on mac
    execCmd(`find ./src \\( -iname \\*.vue -o -iname \\*.js -o -iname \\*.jsx \\) -type f | xargs sed -i ${process.platform === 'darwin' ? '""' : ''} -e '/@typescript-eslint/d;/@ts-expect/d'`, { cwd: this.tempDir })

    // Auto format all files using eslint
    execCmd('pnpm lint', { cwd: this.tempDir })

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
