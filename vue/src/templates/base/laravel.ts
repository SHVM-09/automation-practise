import path from 'path'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import type { TemplateBaseConfig } from './config'
import { Utils } from './helper'
import { execCmd, readFileSyncUTF8, updateFile, writeFileSyncUTF8 } from '@/utils/node'

// TODO: Make sure to update the version in package.json file

export class Laravel extends Utils {
  private projectPath: string
  private resourcesPath: string

  constructor(private templateConfig: TemplateBaseConfig) {
    super()

    this.projectPath = path.join(this.tempDir, this.templateConfig.laravel.pkgName)
    this.resourcesPath = path.join(this.projectPath, 'resources')
  }

  /**
   * ℹ️ This can be generic utility function
   * Adds received import string as last import statement
   *
   * https://regex101.com/r/3NfiKn/2
   *
   * @param data data source to add import
   * @param importStatement import statement as string
   * @returns Returns modified data
   */
  private addImport = (data: string, importStatement: string) => data.replace(/(import .*\n)(\n*)(?!import)/gm, `$1${importStatement}\n$2`)

  // ℹ️ This can be generic utility function
  // https://regex101.com/r/ba5Vcn/2
  private addVitePlugin = (data: string, pluginConfig: string, insertTrailingComma = true) => data.replace(/(( +)plugins:\s*\[)/gm, `$1\n$2$2${pluginConfig}${insertTrailingComma ? ',' : ''}`)

  // ℹ️ This can be generic utility function
  // Thanks: https://stackoverflow.com/a/58032766/10796681
  private removeTrailingAndLeadingSlashes = (str: string) => str.replace(/^\/|\/$/g, '')

  /**
   * ℹ️ This can be generic utility function
   * Safely replace path inside string. It will preserve the path formats (relative & absolute).
   *
   * https://regex101.com/r/rh4M7t/1
   *
   * @param data data to find and replace path in
   * @param oldPath old to replace
   * @param newPath new path to replace with
   * @returns returns data with old path replaced with new path
   */
  private replacePath(data: string, oldPath: string, newPath: string) {
    const _oldPath = this.removeTrailingAndLeadingSlashes(oldPath)
    const _newPath = this.removeTrailingAndLeadingSlashes(newPath)

    // escape forward slashes
    const oldPathPattern = _oldPath.replace(/\//gm, '\\/')

    const pattern = new RegExp(`(\.?[\/]?)${oldPathPattern}\\b(\/|'|")`, 'gm')

    return data.replace(pattern, `$1${_newPath}$2`)
  }

  // https://regex101.com/r/rh4M7t/1
  // private replaceSrcWithResourcesTS = (str: string) => str.replace(/(\.?[\/]?)src\b(\/|'|")/g, '$1resources/ts$2')
  private replaceSrcWithResourcesTS = (str: string) => this.replacePath(str, 'src', 'resources/ts')

  private bootstrapLaravelInTempDir(isTs = true) {
    const lang = isTs ? 'ts' : 'js'

    // Create new laravel project
    execCmd(
      `composer create laravel/laravel ${this.templateConfig.laravel.pkgName}`,
      { cwd: this.tempDir },
    )

    // remove unwanted js/ts dir and create new according to `isTs`
    fs.removeSync(
      path.join(this.resourcesPath, 'js'),
    )
    fs.ensureDirSync(
      path.join(this.resourcesPath, isTs ? 'ts' : 'js'),
    )

    // remove css dir
    fs.removeSync(
      path.join(this.resourcesPath, 'css'),
    )

    // remove existing vite config file
    fs.removeSync(
      path.join(this.projectPath, 'vite.config.js'),
    )

    // replace welcome.blade.php content with index.html
    const indexHtmlContent = readFileSyncUTF8(
      path.join(this.templateConfig.paths.tSFull, 'index.html'),
    )

    writeFileSyncUTF8(
      path.join(this.resourcesPath, 'views', 'welcome.blade.php'),

      indexHtmlContent
        // Remove main.ts import because we will use @vite directive
        .replace(/<script type="module".*/, '')

        // Add vite directive just before closing head to include main.{ts|js} file
        .replace(/<\/head>/, `  @vite(['resources/${lang}/main.${lang}'])\n</head>`),
    )
  }

  private updatePkgJson() {
    const pkgJSONFileName = 'package.json'
    const pkgJSONPath = path.join(this.projectPath, pkgJSONFileName)

    const laravelVitePluginVersion = fs.readJSONSync(pkgJSONPath).devDependencies['laravel-vite-plugin']
    const vuePkgJSON = fs.readJSONSync(
      path.join(this.templateConfig.paths.tSFull, pkgJSONFileName),
    )

    // Add laravel-vite-plugin in devDependencies
    vuePkgJSON.devDependencies['laravel-vite-plugin'] = laravelVitePluginVersion

    // update path in build:icons script
    vuePkgJSON.scripts['build:icons'] = this.replaceSrcWithResourcesTS(vuePkgJSON.scripts['build:icons'])

    fs.writeJSONSync(pkgJSONPath, vuePkgJSON, {
      spaces: 2,
    })
  }

  private updateViteConfig(isTs = true) {
    const lang = isTs ? 'ts' : 'js'

    const viteConfigPath = path.join(this.projectPath, `vite.config.${lang}`)

    updateFile(viteConfigPath, (viteConfig) => {
      // Add laravel vite plugin import
      viteConfig = this.addImport(viteConfig, 'import laravel from \'laravel-vite-plugin\'')

      // add laravel vite plugin in plugins array
      // ℹ️ We aren't adding trailing command because `addVitePlugin` does this
      const laravelPluginConfig = `laravel({
  input: ['resources/js/main.${lang}'],
  refresh: true,
})`
      viteConfig = this.addVitePlugin(viteConfig, laravelPluginConfig)

      viteConfig = viteConfig.replace(/vue\(\)/g, `vue({
  template: {
      transformAssetUrls: {
          base: null,
          includeAbsolute: false,
      },
  },
})`)

      // return modified data
      return viteConfig
    })
  }

  private copyVueProjectFiles() {
    // copy vue project src directory in ts/js dir
    this.copyProject(
      path.join(this.templateConfig.paths.tSFull, 'src'),
      path.join(this.resourcesPath, 'ts'),
    )

    // copy vue project's root files in laravel project
    const rootFilesToCopy = globbySync(
      // ℹ️ We will manually update gitignore file because we have to merge those two files
      ['*', '!package.json', '!index.html', '!DS_Store', '!.gitignore'],
      {
        cwd: this.templateConfig.paths.tSFull,
        onlyFiles: true,
        deep: 0,
        absolute: true,
        dot: true,
      },
    )

    console.log('rootFilesToCopy :>> ', rootFilesToCopy)

    rootFilesToCopy.forEach((filePath) => {
      fs.copyFileSync(
        filePath,
        path.join(this.projectPath, path.basename(filePath)),
      )
    })

    // copy .vscode dir
    fs.copySync(
      path.join(this.templateConfig.paths.tSFull, '.vscode'),
      path.join(this.projectPath, '.vscode'),
    )
  }

  private useStylesDir(isTs = true) {
    const lang = isTs ? 'ts' : 'js'
    const codeConfigFile = isTs ? 'tsconfig.json' : 'jsconfig.json'

    // add new alias in vite config
    // https://regex101.com/r/1RYdYv/2
    updateFile(
      path.join(this.projectPath, `vite.config.${lang}`),
      viteConfig => viteConfig.replace(/(alias: \{\n(\s+))/gm, '$1\'@core-scss\': fileURLToPath(new URL(\'./resources/styles/@core\', import.meta.url)),\n$2'),
    )

    // add new alias in tsconfig/jsconfig
    const configFilePath = path.join(this.projectPath, codeConfigFile)
    const config = fs.readJSONSync(configFilePath)
    config.compilerOptions.paths['@core-scss/*'] = ['resources/styles/@core']
    fs.writeJsonSync(
      configFilePath,
      config,
      { spaces: 2 },
    )

    // replace @core/scss with @core-scss
    execCmd(
      `find ${lang} \\( -iname \\*.vue -o -iname \\*.ts -o -iname \\*.tsx -o -iname \\*.js -o -iname \\*.jsx -o -iname \\*.scss \\) -type f -exec sed -i ${process.platform === 'darwin' ? '""' : ''} -r -e "s/@core\\/scss/@core-scss/g" '{}' \\;`,
      { cwd: this.resourcesPath },
    )

    const stylesDirPath = path.join(this.resourcesPath, 'styles')
    fs.moveSync(
      path.join(this.resourcesPath, lang, 'styles'),
      stylesDirPath,
    )

    fs.moveSync(
      path.join(this.resourcesPath, lang, '@core', 'scss'),
      path.join(stylesDirPath, '@core'),
    );

    // update paths in files
    [codeConfigFile, 'vite.config.ts'].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => this.replacePath(data, 'resources/ts/styles', 'resources/styles'),
      )
    })

    // update relative path to @core's vuetify SASS var file
    updateFile(
      path.join(stylesDirPath, 'variables', '_vuetify.scss'),
      data => this.replacePath(data, '../@core-scss', '@core'),
    )

    // TODO: Need to update path in eslintrc in JS version of template
  }

  genTSFull() {
    // create new laravel project
    this.bootstrapLaravelInTempDir()

    execCmd(`code ${this.projectPath}`)

    this.copyVueProjectFiles()

    // if iconify icon sources have src/assets/images path replace with resources/images
    updateFile(
      path.join(this.resourcesPath, 'ts', '@iconify', 'build-icons.ts'),
      data => this.replacePath(data, 'src/assets/images', 'resources/images'),
    )

    // update package.json
    this.updatePkgJson()

    // handle gitignore file merge
    updateFile(
      path.join(this.projectPath, '.gitignore'),
      data => data += `\n${readFileSyncUTF8(
        path.join(this.templateConfig.paths.tSFull, '.gitignore'),
      )}`,
    );

    // Thanks: https://stackoverflow.com/questions/74609771/how-to-use-foreach-on-inline-array-when-using-typescript
    ['components.d.ts', '.eslintrc.js', 'tsconfig.json', 'vite.config.ts'].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => this.replaceSrcWithResourcesTS(data),
      )
    })

    // update laravel routes file so that it redirect all traffic to welcome.blade.php file
    updateFile(
      path.join(this.projectPath, 'routes', 'web.php'),
      data => data.replace(/^Route(.|\n)*/gm, `Route::get('{any?}', function() {
    return view( 'welcome');
})->where('any', '.*');`),
    )

    // Update vite config
    this.updateViteConfig()

    // install packages
    execCmd('yarn', { cwd: this.projectPath })

    this.useStylesDir()
  }
}
