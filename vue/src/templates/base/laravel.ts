import path from 'path'
import fs from 'fs-extra'
import { globbySync } from 'globby'

import type { TemplateBaseConfig } from './config'
import { Utils } from './helper'

import { addImport, addVitePlugin } from '@/utils/file'
import '@/utils/injectMustReplace'
import { execCmd, readFileSyncUTF8, updateFile, writeFileSyncUTF8 } from '@/utils/node'
import { replacePath } from '@/utils/paths'

// TODO: Make sure to update the version in package.json file

type Lang = 'ts' | 'js'
type LangConfigFile = 'tsconfig.json' | 'jsconfig.json'

export class Laravel extends Utils {
  private projectPath: string
  private resourcesPath: string

  constructor(private templateConfig: TemplateBaseConfig) {
    super()

    this.projectPath = path.join(this.tempDir, this.templateConfig.laravel.pkgName)
    this.resourcesPath = path.join(this.projectPath, 'resources')
  }

  // https://regex101.com/r/rh4M7t/1
  private replaceSrcWithResourcesLang = (str: string, lang: Lang) => replacePath(str, 'src', `resources/${lang}`)

  private bootstrapLaravelInTempDir(lang: Lang, sourcePath: string) {
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
      path.join(this.resourcesPath, lang),
    )

    // Remove unwanted files
    ;[
      // We will use application.blade.php dir instead of welcome.blade.php
      path.join(this.resourcesPath, 'views', 'welcome.blade.php'),

      // We don't need css dir
      path.join(this.resourcesPath, 'css'),

      // remove existing vite config file. We will add new later from vue project
      path.join(this.projectPath, 'vite.config.js'),
    ].forEach((path) => {
      fs.removeSync(path)
    })

    // add application.blade.php with content of index.html
    const indexHtmlContent = readFileSyncUTF8(
      path.join(sourcePath, 'index.html'),
    )

    writeFileSyncUTF8(
      path.join(this.resourcesPath, 'views', 'application.blade.php'),

      indexHtmlContent
        // Remove main.ts import because we will use @vite directive
        .mustReplace(/<script type="module".*/, '')

        // Add vite directive just before closing head to include main.{ts|js} file
        .mustReplace(/<\/head>/, `  @vite(['resources/${lang}/main.${lang}'])\n</head>`),
    )
  }

  private updatePkgJson(sourcePath: string, lang: Lang) {
    const pkgJSONFileName = 'package.json'
    const pkgJSONPath = path.join(this.projectPath, pkgJSONFileName)

    const laravelVitePluginVersion = fs.readJSONSync(pkgJSONPath).devDependencies['laravel-vite-plugin']
    const vuePkgJSON = fs.readJSONSync(
      path.join(sourcePath, pkgJSONFileName),
    )

    // Add laravel-vite-plugin in devDependencies
    vuePkgJSON.devDependencies['laravel-vite-plugin'] = laravelVitePluginVersion

    // remove preview from scripts as preview command is not relevant for laravel
    delete vuePkgJSON.scripts.preview

    // update path in build:icons script
    vuePkgJSON.scripts['build:icons'] = this.replaceSrcWithResourcesLang(vuePkgJSON.scripts['build:icons'], lang)

    fs.writeJSONSync(pkgJSONPath, vuePkgJSON, {
      spaces: 2,
    })
  }

  private updateViteConfig(lang: Lang) {
    const viteConfigPath = path.join(this.projectPath, `vite.config.${lang}`)

    updateFile(viteConfigPath, (viteConfig) => {
      // Add laravel vite plugin import
      viteConfig = addImport(viteConfig, 'import laravel from \'laravel-vite-plugin\'')

      // add laravel vite plugin in plugins array
      // ℹ️ We aren't adding trailing command because `addVitePlugin` does this
      const laravelPluginConfig = `laravel({
  input: ['resources/${lang}/main.${lang}'],
  refresh: true,
})`
      viteConfig = addVitePlugin(viteConfig, laravelPluginConfig)

      viteConfig = viteConfig.mustReplace(/vue\(\)/g, `vue({
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

  private copyVueProjectFiles(lang: Lang, sourcePath: string) {
    // copy vue project src directory in ts/js dir
    this.copyProject(
      path.join(sourcePath, 'src'),
      path.join(this.resourcesPath, lang),
    )

    // copy vue project's root files in laravel project
    const rootFilesToCopy = globbySync(
      // ℹ️ We will manually update gitignore file because we have to merge those two files
      ['*', '!package.json', '!index.html', '!.DS_Store', '!.gitignore'],
      {
        cwd: sourcePath,
        onlyFiles: true,
        deep: 0,
        absolute: true,
        dot: true,
      },
    )

    rootFilesToCopy.forEach((filePath) => {
      fs.copyFileSync(
        filePath,
        path.join(this.projectPath, path.basename(filePath)),
      )
    })

    // copy .vscode dir
    fs.copySync(
      path.join(sourcePath, '.vscode'),
      path.join(this.projectPath, '.vscode'),
    )

    // Copy vue project's public files in laravel project's public dir
    const publicFilesToCopy = globbySync('*', {
      cwd: path.join(sourcePath, 'public'),
      dot: true,
      absolute: true,
    })
    publicFilesToCopy.forEach((filePath) => {
      fs.copyFileSync(
        filePath,
        path.join(this.projectPath, 'public', path.basename(filePath)),
      )
    })
  }

  private useStylesDir(lang: Lang, langConfigFile: LangConfigFile) {
    // add new alias in vite config
    // https://regex101.com/r/1RYdYv/2
    updateFile(
      path.join(this.projectPath, `vite.config.${lang}`),
      viteConfig => viteConfig.mustReplace(/(alias: \{\n(\s+))/gm, '$1\'@core-scss\': fileURLToPath(new URL(\'./resources/styles/@core\', import.meta.url)),\n$2'),
    )

    // add new alias in tsconfig/jsconfig
    const configFilePath = path.join(this.projectPath, langConfigFile)
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
    [langConfigFile, `vite.config.${lang}`, '.eslintrc.js'].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => replacePath(data, `resources/${lang}/styles`, 'resources/styles'),
      )
    })

    // update relative path to @core's vuetify SASS var file
    updateFile(
      path.join(stylesDirPath, 'variables', '_vuetify.scss'),
      data => replacePath(data, '../@core-scss', '@core'),
    )
  }

  private moveImages(lang: Lang, langConfigFile: LangConfigFile) {
    const assetsDir = path.join(this.resourcesPath, lang, 'assets')
    // Move images dir from resources/ts/assets/images to resource/images
    fs.moveSync(
      path.join(assetsDir, 'images'),
      path.join(this.resourcesPath, 'images'),
    )

    // remove assets dir because it's now empty
    fs.removeSync(assetsDir)

    // update path in files
    ;[langConfigFile, `vite.config.${lang}`, '.eslintrc.js'].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => replacePath(data, `resources/${lang}/assets/images`, 'resources/images'),
      )
    })
  }

  genLaravel(options?: { isSk?: boolean; isJS?: boolean }) {
    const { isSk = false, isJS = false } = options || {}

    console.log('isSk :>> ', isSk)
    console.log('isJS :>> ', isJS)

    const sourcePath = isJS
      ? isSk
        ? this.templateConfig.paths.jSStarter
        : this.templateConfig.paths.jSFull
      : isSk
        ? this.templateConfig.paths.tSStarter
        : this.templateConfig.paths.tSFull

    const lang: Lang = isJS ? 'js' : 'ts'
    const langConfigFile: LangConfigFile = lang === 'ts' ? 'tsconfig.json' : 'jsconfig.json'

    console.log('this.projectPath :>> ', this.projectPath)

    // create new laravel project
    this.bootstrapLaravelInTempDir(lang, sourcePath)

    this.copyVueProjectFiles(lang, sourcePath)

    // if iconify icon sources have src/assets/images path replace with resources/images
    updateFile(
      path.join(this.resourcesPath, lang, '@iconify', `build-icons.${lang}`),
      data => replacePath(data, 'src/assets/images', 'resources/images'),
    )

    // update package.json
    this.updatePkgJson(sourcePath, lang)

    // handle gitignore file merge
    updateFile(
      path.join(this.projectPath, '.gitignore'),
      data => data += `\n${readFileSyncUTF8(
        path.join(sourcePath, '.gitignore'),
      )}`,
    )

    // Thanks: https://stackoverflow.com/questions/74609771/how-to-use-foreach-on-inline-array-when-using-typescript
    ;['components.d.ts', '.eslintrc.js', langConfigFile, `vite.config.${lang}`].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => this.replaceSrcWithResourcesLang(data, lang),
      )
    })

    // update laravel routes file so that it redirect all traffic to application.blade.php file
    updateFile(
      path.join(this.projectPath, 'routes', 'web.php'),
      data => data.mustReplace(/^Route(.|\n)*/gm, `Route::get('{any?}', function() {
    return view('application');
})->where('any', '.*');`),
    )

    // Update vite config
    this.updateViteConfig(lang)

    // install packages
    execCmd('yarn', { cwd: this.projectPath })

    this.useStylesDir(lang, langConfigFile)

    // execCmd('git init && git add . && git commit -m init', { cwd: this.projectPath })

    this.moveImages(lang, langConfigFile)

    console.log(`Generated at ${this.projectPath}`)
  }
}
