import path from 'node:path'
import * as url from 'node:url'
import fs from 'fs-extra'
import { globbySync } from 'globby'

import type { GenPkgHooks } from '@types'
import { consola } from 'consola'
import { loadFile, writeFile } from 'magicast'
import { addVitePlugin, updateVitePluginConfig } from 'magicast/helpers'
import type { PackageJson } from 'type-fest'
import type { TemplateBaseConfig } from './config'
import { Utils, injectGTM } from './helper'

import { getPackagesVersions, pinPackagesVersions, reportOversizedFiles } from '@/utils/file'
import '@/utils/injectMustReplace'
import { execCmd, filterFileByLine, readFileSyncUTF8, replaceDir, updateFile, updateJSONFileField, writeFileSyncUTF8 } from '@/utils/node'
import { getTemplatePath, replacePath } from '@/utils/paths'
import { TempLocation } from '@/utils/temp'
import { updatePkgJsonVersion } from '@/utils/template'

type Lang = 'ts' | 'js'
type LangConfigFile = 'tsconfig.json' | 'jsconfig.json'

export class Laravel extends Utils {
  private projectPath: string
  private resourcesPath: string
  private isGenLaravelForFirstTime: boolean
  private currentLaravelVersion!: string

  constructor(private templateConfig: TemplateBaseConfig) {
    super()

    this.projectPath = path.join(this.tempDir, this.templateConfig.laravel.pkgName)
    this.resourcesPath = path.join(this.projectPath, 'resources')

    this.isGenLaravelForFirstTime = !!this.templateConfig.laravel.projectPath
    consola.info(
      this.isGenLaravelForFirstTime
        ? `Laravel dir (${this.templateConfig.laravel.projectPath}) exist, Marking process as generating laravel for first time`
        : `Laravel dir (${this.templateConfig.laravel.projectPath}) doesn't exist, Marking process as updating existing laravel`,
    )
  }

  private initializePaths() {
    this.tempDir = new TempLocation().tempDir
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

    execCmd(
      'php artisan sail:install  --no-interaction',
      { cwd: this.projectPath },
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
        .mustReplace(/<script type="module".*/g, '')

        // Add vite directive just before closing head to include main.{ts|js} file
        .mustReplace(/<\/head>/g, `  @vite(['resources/${lang}/main.${lang}'])\n</head>`)

        // use laravel's asset helper
        .mustReplace(/\/(favicon\.ico|loader.css)/g, '{{ asset(\'$1\') }}'),
    )
  }

  private updatePkgJson(sourcePath: string, lang: Lang) {
    const pkgJSONFileName = 'package.json'
    const pkgJSONPath = path.join(this.projectPath, pkgJSONFileName)

    const laravelVitePluginVersion = fs.readJSONSync(pkgJSONPath).devDependencies['laravel-vite-plugin']
    const vuePkgJSON: PackageJson = fs.readJSONSync(
      path.join(sourcePath, pkgJSONFileName),
    )

    // Update package version according to laravel's current version
    vuePkgJSON.version = this.currentLaravelVersion

    // Update package name
    vuePkgJSON.name = this.templateConfig.laravel.pkgName

    // Add laravel-vite-plugin in devDependencies
    if (!vuePkgJSON.devDependencies) {
      consola.error(new Error('devDependencies field not found in package.json'))
      return
    }
    vuePkgJSON.devDependencies['laravel-vite-plugin'] = laravelVitePluginVersion

    if (!vuePkgJSON.scripts) {
      consola.error(new Error('scripts field not found in package.json'))
      return
    }

    // remove preview from scripts as preview command is not relevant for laravel
    delete vuePkgJSON.scripts.preview

    // update path in build:icons script
    vuePkgJSON.scripts['build:icons'] = this.replaceSrcWithResourcesLang(vuePkgJSON.scripts['build:icons'], lang)

    fs.writeJSONSync(pkgJSONPath, vuePkgJSON, {
      spaces: 2,
    })
  }

  private async updateViteConfig(lang: Lang) {
    const viteConfigPath = path.join(this.projectPath, `vite.config.${lang}`)

    const mod = await loadFile(viteConfigPath)

    updateVitePluginConfig(mod, '@vitejs/plugin-vue', {
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    })

    updateVitePluginConfig(mod, 'unplugin-vue-router/vite', {
      routesFolder: `resources/${lang}/pages`,
    })

    addVitePlugin(mod, {
      from: 'laravel-vite-plugin',
      constructor: 'laravel',
      options: {
        input: [`resources/${lang}/main.${lang}`],
        refresh: true,
      },
      index: 2,
    })

    await writeFile(mod.$ast, viteConfigPath, {
      quote: 'single',
      trailingComma: true,
    })
  }

  // 👉 updateTSConfig
  private updateTSConfig(lang: Lang) {
    // Path to tsconfig.json/jsconfig.json
    const tsJsConfigPath = path.join(this.projectPath, `${lang}config.json`)

    // read tsconfig/jsconfig
    const tsJsConfig = fs.readJsonSync(tsJsConfigPath)

    // adding base url in to tsconfig/jsconfig
    if (!tsJsConfig.compilerOptions.baseUrl)
      tsJsConfig.compilerOptions = { baseUrl: './', ...tsJsConfig.compilerOptions }

    // Write back to tsconfig/jsconfig
    fs.writeJsonSync(tsJsConfigPath, tsJsConfig, { spaces: 2 })
  }

  private updateEnvFile() {
    // update .env & .env.example files
    [
      path.join(this.projectPath, '.env'),
      path.join(this.projectPath, '.env.example'),
    ].forEach((filePath) => {
      updateFile(
        filePath,
        (data) => {
          return filePath.includes('example') ? `${data}VITE_API_BASE_URL=` : `${data}VITE_API_BASE_URL=http://127.0.0.1:8000/api`
        },
      )
    })
  }

  private copyVueProjectFiles(lang: Lang, sourcePath: string, isJS: boolean) {
    // copy vue project src directory in ts/js dir
    this.copyProject(
      path.join(sourcePath, 'src'),
      path.join(this.resourcesPath, lang),
    )

    // copy vue project's root files in laravel project
    const rootFilesToCopy = globbySync(
      // ℹ️ We will manually update gitignore file because we have to merge those two files
      ['*', '!package.json', '!index.html', '!.DS_Store', '!.gitignore', '!.env', '!.env.example'],
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

    // copy .vscode & eslint-internal-rules dir
    ;['.vscode', ...(isJS ? [] : ['eslint-internal-rules'])].forEach((dirName) => {
      fs.copySync(
        path.join(sourcePath, dirName),
        path.join(this.projectPath, dirName),
      )
    })

    // Copy vue project's public files in laravel project's public dir
    const publicFilesToCopy = globbySync('**/**', {
      cwd: path.join(sourcePath, 'public'),
      dot: true,
      absolute: true,
    })
    publicFilesToCopy.forEach((filePath) => {
      // get file path after public
      const pathDir = filePath.split('public/')[1]
      fs.mkdirSync(`${this.projectPath}/public/images/avatars`, { recursive: true })
      fs.copyFileSync(
        filePath,
        path.join(this.projectPath, 'public', pathDir),
      )
    })
  }

  private useStylesDir(lang: Lang, langConfigFile: LangConfigFile) {
    const assetsDir = path.join(this.resourcesPath, lang, 'assets')

    // add new alias in vite config
    // https://regex101.com/r/1RYdYv/2
    updateFile(
      path.join(this.projectPath, `vite.config.${lang}`),
      viteConfig => viteConfig.mustReplace(/(alias: \{\n(\s+))/gm, '$1\'@core-scss\': fileURLToPath(new URL(\'./resources/styles/@core\', import.meta.url)),\n$2'),
    )

    // add new alias in tsconfig/jsconfig
    const configFilePath = path.join(this.projectPath, langConfigFile)
    const config = fs.readJSONSync(configFilePath)
    config.compilerOptions.paths['@core-scss/*'] = ['resources/styles/@core/*']
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
      path.join(this.resourcesPath, lang, 'assets/styles'),
      stylesDirPath,
    )

    fs.moveSync(
      path.join(this.resourcesPath, lang, '@core', 'scss'),
      path.join(stylesDirPath, '@core'),
    )

    // remove assets dir because it's now empty
    fs.removeSync(assetsDir)

    // update paths in files
    ;[langConfigFile, `vite.config.${lang}`, '.eslintrc.cjs'].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => replacePath(data, `resources/${lang}/assets/styles`, 'resources/styles'),
      )
    })

    // update relative path to @core's vuetify SASS var file
    updateFile(
      path.join(stylesDirPath, 'variables', '_vuetify.scss'),
      data => replacePath(data, '../../../@core-scss', '../@core'),
    )
  }

  private moveImages(lang: Lang, langConfigFile: LangConfigFile) {
    const assetsDir = path.join(this.resourcesPath, lang, 'assets')
    // Move images dir from resources/ts/assets/images to resource/images
    fs.moveSync(
      path.join(assetsDir, 'images'),
      path.join(this.resourcesPath, 'images'),
    )

    // update path in files
    ;[langConfigFile, `vite.config.${lang}`, '.eslintrc.cjs'].forEach((fileName) => {
      updateFile(
        path.join(this.projectPath, fileName),
        data => replacePath(data, `resources/${lang}/assets/images`, 'resources/images'),
      )
    })
  }

  /**
   * TODO: This is duplicated from base/genDemo.ts
   * Modifies the files to attach the demo-$number pattern to make all demos unique
   * This is used to isolate the demo config
   * @param demoNumber localStorage key to update for demo
   * @param templateName
   */
  private updateLocalStorageKeys(demoNumber: number, templateName: string) {
    // default values for demo 1
    let nameSpaceFind = 'layoutConfig.app.title}'
    let nameSpaceReplace = 'layoutConfig.app.title}-vue-demo-1'

    let indexHTMLFind = new RegExp(`(localStorage\.getItem\\('${templateName})`, 'g')
    let indexHTMLReplace = '$1-vue-laravel-demo-1'

    // If it's not 1st demo update the find replace strings
    if (demoNumber !== 1) {
      const findStr = (() => `demo-${demoNumber - 1}`)()
      const replaceStr = `demo-${demoNumber}`

      nameSpaceFind = findStr
      nameSpaceReplace = replaceStr

      indexHTMLFind = new RegExp(findStr, 'g')
      indexHTMLReplace = replaceStr
    }

    // update nameSpace config in config.ts file
    updateFile(
      path.join(this.templateConfig.laravel.paths.TSFull, 'resources', 'ts', '@layouts', 'stores', 'config.ts'),
      data => data.mustReplace(nameSpaceFind, nameSpaceReplace),
    )

    // update index.html as well
    updateFile(
      // Path to `index.html`
      path.join(this.templateConfig.laravel.paths.TSFull, 'resources', 'views', 'application.blade.php'),
      data => data.mustReplace(indexHTMLFind, indexHTMLReplace),
    )
  }

  private insertDeployLaravelDemoGhAction() {
    // ❗ We have intentionally set template name as "materio" in placeholder workflow files instead of master to update it without worrying about some file may have branch name master and gets replaces with template name

    // Update/Add GitHub action
    const ghWorkflowsDir = path.join(this.templateConfig.laravel.projectPath, '.github', 'workflows')

    // Make sure workflow dir exist
    fs.ensureDirSync(ghWorkflowsDir)

    // get path of workflow file from base's data dir
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
    const baseDataDirPath = path.join(__dirname, 'data')

    const deployLaravelDemosWorkflowSourceFilePath = path.join(baseDataDirPath, 'deploy-laravel-demos.yml')
    const deployLaravelDemosWorkflowFilePath = path.join(ghWorkflowsDir, path.basename(deployLaravelDemosWorkflowSourceFilePath))

    // copy file from data to github workflow dir
    fs.copyFileSync(
      deployLaravelDemosWorkflowSourceFilePath,
      deployLaravelDemosWorkflowFilePath,
    )

    // ℹ️ Only add release laravel workflow if template is for themeselection
    if (this.templateConfig.templateDomain === 'ts') {
      const releaseWorkflowSourceFilePath = path.join(baseDataDirPath, 'release-laravel.yml')
      const releaseWorkflowFilePath = path.join(ghWorkflowsDir, path.basename(releaseWorkflowSourceFilePath))
      // copy file from data to github workflow dir
      fs.copyFileSync(
        releaseWorkflowSourceFilePath,
        releaseWorkflowFilePath,
      )
    }
  }

  private updateRepoRootFiles() {
    const pkgJsonPath = path.join(this.templateConfig.laravel.projectPath, 'package.json')
    const gitIgnorePath = path.join(this.templateConfig.laravel.projectPath, '.gitignore')
    const masterVuePath = getTemplatePath('master', 'vue')

    // ❗ Only update root package.json & .gitignore if master vue dir exist
    // ℹ️ This will make cloning master vue repo optional when generating pkg in release github action
    if (!fs.pathExistsSync(masterVuePath)) {
      consola.info('master vue doesn\'t exist. Omitting updating root package.json & gitignore')
      return
    }

    // Update root package.json file
    fs.copyFileSync(
      path.join(masterVuePath, 'package.json'),
      pkgJsonPath,
    )

    // // Update version from 0.0.0 to actual version
    // const tsFullPkgJSONPath = path.join(this.templateConfig.paths.tSFull, 'package.json')
    // updateJSONFileField(pkgJsonPath, 'version', fs.readJSONSync(tsFullPkgJSONPath).version)

    // if repo is for pixinvent
    if (this.templateConfig.templateDomain === 'pi')
      // Update release command => Remove prompt for changing CHANGELOG.md
      updateFile(pkgJsonPath, data => data.mustReplace(/(?<="release": ").*(?=pnpm bumpp)/g, ''))

    // Update root .gitignore file
    fs.copyFileSync(
      path.join(masterVuePath, '.gitignore'),
      gitIgnorePath,
    )
    // Remove JS version from gitignore
    filterFileByLine(gitIgnorePath, line => !line.includes('javascript-version'))
  }

  private async genLaravel(options?: { isSK?: boolean; isJS?: boolean; isFree?: boolean }) {
    /*
      ℹ️ Even though constructor of this class assigns the temp dir to the class we have to reinitialize the temp dir
      because `genLaravel` method is called multiple times after initializing the class once
    */
    this.initializePaths()

    const { isSK = false, isJS = false, isFree = false } = options || {}

    const sourcePath
      // If Free version
      = isFree
        ? isJS
          ? this.templateConfig.paths.freeJS
          : this.templateConfig.paths.freeTS

        // (Else) Premium
        : isJS
          // If JS Version
          ? isSK
            ? this.templateConfig.paths.jSStarter
            : this.templateConfig.paths.jSFull

          // (Else) TS Version
          : isSK
            ? this.templateConfig.paths.tSStarter
            : this.templateConfig.paths.tSFull

    const lang: Lang = isJS ? 'js' : 'ts'
    const langConfigFile: LangConfigFile = lang === 'ts' ? 'tsconfig.json' : 'jsconfig.json'

    // create new laravel project
    this.bootstrapLaravelInTempDir(lang, sourcePath)

    this.copyVueProjectFiles(lang, sourcePath, isJS)

    // Remove generated js files from iconify dir
    if (!isJS) {
      const filesToRemove = globbySync(
        '*.js',
        {
          cwd: path.join(this.resourcesPath, lang, 'plugins/iconify'),
          absolute: true,
        },
      )

      filesToRemove.forEach(filePath => fs.removeSync(filePath))
    }

    // Exclude build dir from base URL in msw worker URL
    if (!isSK) {
      updateFile(
        path.join(this.resourcesPath, lang, 'plugins', 'fake-api', `index.${lang}`),
        data => data.mustReplace(/BASE_URL/g, 'BASE_URL.replace(/build\/$/g, \'\')'),
      )
    }

    // add core-scss alias in  eslint-import-resolver-custom-alias in eslint
    // https://regex101.com/r/GXptyF/1
    if (isJS) {
      updateFile(
        path.join(this.projectPath, '.eslintrc.cjs'),
        data => data.mustReplace(/('alias': \{\n(\s+))/g, '$1\"@core-scss": "./resources/styles/@core",\n$2'),
      )
    }

    // if iconify icon sources have src/assets/images path replace with resources/images
    updateFile(
      path.join(this.resourcesPath, lang, 'plugins/iconify', `build-icons.${lang}`),
      data => replacePath(data, 'src/assets/images', 'resources/images'),
    )

    // Update BuyNow or Upgrade to pro link
    if (isFree) {
      updateFile(
        path.join(this.resourcesPath, lang, 'components', 'UpgradeToPro.vue'),
        data => data
          .mustReplace('vuejs-admin-template', 'vuejs-laravel-admin-template')
          .mustReplace('Vuetify Admin Template', 'Vuetify Laravel Admin Template'),
      )
    }
    else {
      updateFile(
        path.join(this.resourcesPath, lang, '@core', 'components', 'BuyNow.vue'),
        data => data.replace(/https:\/\/themeselection\.com.*\//g, this.templateConfig.laravel.buyNowLink),
      )
    }

    // update package.json
    this.updatePkgJson(sourcePath, lang)

    // handle gitignore file merge
    updateFile(
      path.join(this.projectPath, '.gitignore'),
      (data) => {
        data += `\n${readFileSyncUTF8(
          path.join(sourcePath, '.gitignore'),
        )}`

        data = data.split('\n')
          .filter(line => !line.includes('/.vscode'))
          .join('\n')

        return data
      },
    )

    // Thanks: https://stackoverflow.com/questions/74609771/how-to-use-foreach-on-inline-array-when-using-typescript
    ;[...(lang === 'ts' ? ['components.d.ts'] : []), '.eslintrc.cjs', '.gitignore', langConfigFile, `vite.config.${lang}`].forEach((fileName) => {
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

    // update documentation link
    ;[
      path.join(this.resourcesPath, lang, 'layouts', 'components', 'Footer.vue'),
      path.join(this.resourcesPath, lang, 'navigation', 'horizontal', `others.${lang}`),
      path.join(this.resourcesPath, lang, 'navigation', 'vertical', `others.${lang}`),
    ].forEach((filePath) => {
      if (fs.pathExistsSync(filePath)) {
        updateFile(
          filePath,
          // we have used replaceAll instead of mustReplace because when match is not found mustReplace throws error
          data => data.replaceAll(
            this.templateConfig.documentation.docUrl,
            this.templateConfig.laravel.documentation.docUrl,
          ),
        )
      }
    })

    // Update vite config
    await this.updateViteConfig(lang)

    // Update tsconfig.json
    this.updateTSConfig(lang)

    // Update env file
    this.updateEnvFile()

    // ❗ We are moving images before doing `pnpm` because we have postinstall script that can generate SVG based on iconify-svg dir and this dir is in images
    this.moveImages(lang, langConfigFile)

    // install packages
    execCmd('pnpm install', { cwd: this.projectPath })

    this.useStylesDir(lang, langConfigFile)

    // execCmd('git init && git add . && git commit -m init', { cwd: this.projectPath })

    const replaceDest = (() => {
      const paths = this.templateConfig.laravel.paths

      if (isFree)
        return isJS ? paths.freeJS : paths.freeTS
      else if (isJS)
        return isSK ? paths.JSStarter : paths.JSFull
      else
        return isSK ? paths.TSStarter : paths.TSFull
    })()

    // Update links in laravel free
    if (isFree) {
      const filesToUpdateLinksIn = [
        path.join(this.projectPath, 'resources', lang, 'layouts', 'components', 'DefaultLayoutWithVerticalNav.vue'),
        path.join(this.projectPath, 'package.json'),
      ]

      filesToUpdateLinksIn.forEach((filePath) => {
        updateFile(
          filePath,
          data => data.mustReplace(`${this.templateConfig.templateName}-vuetify-vuejs-admin-template`, `${this.templateConfig.templateName}-vuetify-vuejs-laravel-admin-template`),
        )
      })
    }

    // Make sure dest dir exist. This is useful if we are generating laravel for first time.
    fs.ensureDirSync(replaceDest)

    // Place temp dir content in js full version
    replaceDir(this.projectPath, replaceDest)

    execCmd('pnpm lint', { cwd: replaceDest })
  }

  async genPkg(hooks: GenPkgHooks, isInteractive = true, newPkgVersion?: string) {
    const { TSFull } = this.templateConfig.laravel.paths

    // Set current laravel version in class property
    if (this.isGenLaravelForFirstTime) {
      this.currentLaravelVersion = '0.0.0'
    }
    else {
      const laravelPkgJSON: PackageJson = fs.readJSONSync(
        path.join(TSFull, 'package.json'),
      )

      this.currentLaravelVersion = laravelPkgJSON.version || '0.0.0'
    }

    // Generate Laravel TS Full
    await this.genLaravel()

    // Report if any file is over 100KB
    /*
      ℹ️ We aren't compressing files like vue package because laravel is generated from vue package
      Hence, if there's any asset over 100KB, just report it.
    */
    await reportOversizedFiles(
      `${TSFull}/resources/images`,
      isInteractive,
      { reportPathRelativeTo: TSFull },
    )

    // Generate Laravel TS Starter
    await this.genLaravel({ isSK: true })

    // Generate Laravel JS Full
    await this.genLaravel({ isJS: true })

    // Generate Laravel JS Starter
    await this.genLaravel({
      isJS: true,
      isSK: true,
    })

    this.updateRepoRootFiles()

    this.insertDeployLaravelDemoGhAction()

    // Create new temp dir for storing pkg
    const tempPkgDir = new TempLocation().tempDir
    const tempPkgTS = path.join(tempPkgDir, 'typescript-version')
    const tempPkgJS = path.join(tempPkgDir, 'javascript-version')

    const tempPkgTSFull = path.join(tempPkgTS, 'full-version')
    const tempPkgTSStarter = path.join(tempPkgTS, 'starter-kit')

    // Create dirs
    fs.ensureDirSync(tempPkgTSFull)
    fs.ensureDirSync(tempPkgTSStarter)

    const tempPkgJSFull = path.join(tempPkgJS, 'full-version')
    const tempPkgJSStarter = path.join(tempPkgJS, 'starter-kit')

    // Create dirs
    fs.ensureDirSync(tempPkgJSFull)
    fs.ensureDirSync(tempPkgJSStarter)

    this.copyProject(this.templateConfig.laravel.paths.TSFull, tempPkgTSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.laravel.paths.TSStarter, tempPkgTSStarter, this.templateConfig.packageCopyIgnorePatterns)

    this.copyProject(this.templateConfig.laravel.paths.JSFull, tempPkgJSFull, this.templateConfig.packageCopyIgnorePatterns)
    this.copyProject(this.templateConfig.laravel.paths.JSStarter, tempPkgJSStarter, this.templateConfig.packageCopyIgnorePatterns)

    // update node package version in both full versions and starter kits package.json file (ts/js)
    const packageVersions = getPackagesVersions(this.templateConfig.laravel.paths.TSFull)
    pinPackagesVersions(packageVersions, tempPkgTSFull)
    pinPackagesVersions(packageVersions, tempPkgTSStarter)
    pinPackagesVersions(packageVersions, tempPkgJSFull)
    pinPackagesVersions(packageVersions, tempPkgJSStarter)

    // Remove BuyNow from both full versions
    // TODO: removeBuyNow method is not generic
    ;[tempPkgTSFull, tempPkgJSFull].forEach((projectPath, index) => {
      filterFileByLine(
        path.join(projectPath, 'resources', index === 0 ? 'ts' : 'js', 'App.vue'),
        line => !line.includes('BuyNow'),
      )
    })
    // this.removeBuyNow(tempPkgTSFull)
    // this.removeBuyNow(tempPkgJSFull)

    // Remove test pages from both full versions
    execCmd(`rm -rf ${path.join(tempPkgTSFull, 'resources', 'ts', 'pages', 'pages', 'test')}`)
    execCmd(`rm -rf ${path.join(tempPkgJSFull, 'resources', 'js', 'pages', 'pages', 'test')}`)

    // Copy documentation.html file from root of the repo
    fs.copyFileSync(
      path.join(this.templateConfig.projectPath, 'documentation.html'),
      path.join(tempPkgDir, 'documentation.html'),
    )

    // package.json files paths in all four versions
    const pkgJsonPaths = [tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].map(p => path.join(p, 'package.json'))

    // update package name in package.json
    pkgJsonPaths.forEach((pkgJSONPath) => {
      updateJSONFileField(pkgJSONPath, 'name', this.templateConfig.laravel.pkgName)
    })

    // package version for package name
    // ℹ️ If we run script non-interactively and don't pass package version, pkgVersionForZip will be null => we won't prepend version to package name
    let pkgVersionForZip: string | null = null

    if (isInteractive || newPkgVersion)
      pkgVersionForZip = await updatePkgJsonVersion(pkgJsonPaths, path.join(tempPkgTSFull, 'package.json'), newPkgVersion)

    // Ask for running `postProcessGeneratedPkg` if pixinvent
    if (this.templateConfig.templateDomain === 'pi') {
      if (await consola.prompt('Vue package is ready to rock, Do you want me to inject it in last pkg?'))
        await hooks.postProcessGeneratedPkg(tempPkgDir)
    }
    else {
      await hooks.postProcessGeneratedPkg(tempPkgDir, true)
    }
    consola.success('Package `postProcessGeneratedPkg` hook ran successfully\n')

    const zipPath = path.join(
      this.templateConfig.laravel.projectPath,
      `${this.templateConfig.laravel.pkgName}${pkgVersionForZip ? `-v${pkgVersionForZip}` : ''}.zip`,
    )

    execCmd(`zip -rq ${zipPath} .`, { cwd: tempPkgDir })
    consola.success(`Package generated at: ${zipPath}`)
  }

  async genFreeLaravel() {
    // Generate TS Version
    await this.genLaravel({ isFree: true })

    // // Generate JS Version
    await this.genLaravel({ isFree: true, isJS: true })

    // Copy release related files
    const vueRepoRoot = path.join(this.templateConfig.paths.freeTS, '..')
    const vueLaravelRepoRoot = path.join(this.templateConfig.laravel.paths.freeTS, '..')

    console.log(execCmd(`ls -la ${vueRepoRoot}`, { encoding: 'utf-8' }))
    console.log(execCmd('pwd', { encoding: 'utf-8', cwd: vueRepoRoot }))

    const filesToCopy = [
      'package.json',
      'pnpm-lock.yaml',
      '.gitignore',
    ]

    // Copy files asynchronously
    await Promise.all(
      filesToCopy.map(file => fs.copy(
        path.join(vueRepoRoot, file),
        path.join(vueLaravelRepoRoot, file)),
      ),
    )
  }

  genDemos(isStaging: boolean) {
    consola.info('isStaging: ', isStaging.toString())

    const { TSFull } = this.templateConfig.laravel.paths

    const envPath = path.join(TSFull, '.env')

    if (!fs.existsSync(envPath)) {
      fs.copyFileSync(
        path.join(TSFull, '.env.example'),
        envPath,
      )
    }

    execCmd(`rm -rf ${path.join(TSFull, 'resources', 'ts', 'pages', 'pages', 'test')}`)

    // Generate application key
    execCmd('php artisan key:generate', { cwd: TSFull })

    const envContent = readFileSyncUTF8(envPath)

    // inject GTM code in index.html file
    injectGTM(
      path.join(TSFull, 'resources', 'views', 'application.blade.php'),
      this.templateConfig.gtm,
    )

    // update index.php file
    const indexPhpPath = path.join(this.templateConfig.laravel.paths.TSFull, 'public', 'index.php')

    // TODO: Do something on repetition of `${this.templateConfig.laravel.pkgName}${isStaging ? '-staging' : ''}`

    // We need to update the path of some laravel core file as we have laravel core outside of html dir in our server
    const laravelCoreRelativePath = (() => {
      /*
          ℹ️ Calculating the relative laravel-core-container path

          pixinvent => 4 dir up (+1 if staging)
          ThemeSelection => 4 dir up (+1 if staging)
        */
      const numOfDirsToTraverseUpwards = 4 + (isStaging ? 1 : 0)

      // '/' + '../'.repeat(3) => '/../../../'
      return `/${'../'.repeat(numOfDirsToTraverseUpwards)}laravel-core-container/${this.templateConfig.laravel.pkgName}${isStaging ? '-staging' : ''}/`
    })()

    updateFile(indexPhpPath, (data) => {
      return data
        .mustReplace(/(?<=__DIR__.')([\.\/]+)(?=\w)/g, laravelCoreRelativePath)

        // Add app bind
        // TODO: Handle unwanted slash by mistake
        .mustReplace(/(?<=^\$app.*\n)/gm, '\napp()->usePublicPath(__DIR__);\n')
    })

    const themeConfigPath = path.join(TSFull, 'themeConfig.ts')
    const themeConfig = fs.readFileSync(themeConfigPath, { encoding: 'utf-8' })

    this.templateConfig.demosConfig.forEach((demoConfig, demoIndex) => {
      // Generate demo number
      const demoNumber = demoIndex + 1

      consola.info(`Generating demo ${demoNumber}`)

      consola.info('Updating localStorage keys...')
      this.updateLocalStorageKeys(demoNumber, this.templateConfig.templateName)

      // ℹ️ Demo config can be null if there's no changes in themeConfig
      if (demoConfig) {
        // clone themeConfig
        let demoThemeConfig = themeConfig

        // Loop over demo config and make changes in cloned themeConfig
        demoConfig.forEach((changes) => {
          demoThemeConfig = demoThemeConfig.mustReplace(changes.find, changes.replace)
        })

        // Update themeConfig file
        fs.writeFileSync(themeConfigPath, demoThemeConfig, { encoding: 'utf-8' })
      }

      // Create base path based on demoNumber and env (staging|production)
      const demoDeploymentBase = this.templateConfig.laravel.demoDeploymentBase(demoNumber, isStaging)

      // Update .env file
      updateFile(
        envPath,
        data => data
          .mustReplace(/(APP_URL=.*)(\nASSET_URL=.*)?/g, `$1\nASSET_URL=${demoDeploymentBase}`),
      )

      updateFile(
        path.join(this.templateConfig.laravel.paths.TSFull, 'resources', 'ts', 'plugins', '1.router', 'index.ts'),
        data => data.mustReplace(/(?<=createWebHistory\()(.*)(?=\))/g, `'${demoDeploymentBase}'`),
      )

      // Run build
      execCmd('pnpm build', { cwd: this.templateConfig.laravel.paths.TSFull })
      execCmd('pnpm msw:init', { cwd: this.templateConfig.laravel.paths.TSFull })

      // At the moment of this script execution, we will have "public" in root the TSFull
      // Duplicate public to demo-$demoNumber
      fs.copySync(
        path.join(this.templateConfig.laravel.paths.TSFull, 'public'),
        path.join(this.templateConfig.laravel.paths.TSFull, `demo-${demoNumber}`),
      )

      // Reset the themeConfig
      fs.writeFileSync(themeConfigPath, themeConfig, { encoding: 'utf-8' })

      consola.success(`Demo ${demoNumber} generation completed`)
    })

    // Remove node_modules & public dir
    // ;['node_modules', 'public'].forEach((dirName) => {
    //   fs.removeSync(path.join(this.templateConfig.laravel.paths.TSFull, dirName))
    // })

    // Remove ASSET_URL as we don't want it in laravel core
    updateFile(envPath, data => data.mustReplace(/ASSET_URL=.*/g, ''))

    consola.info('Creating zip...')

    // ℹ️ We are only creating this dir to wrap the content in dir `this.templateConfig.laravel.pkgName`
    const zipWrapperDirParent = new TempLocation().tempDir
    const zipWrapperDir = path.join(zipWrapperDirParent, `${this.templateConfig.laravel.pkgName}${isStaging ? '-staging' : ''}`)

    // Make sure this dir exist so we copy the content
    fs.ensureDirSync(zipWrapperDir)

    // Copy everything from TS Full except node_modules & public dir
    fs.copySync(this.templateConfig.laravel.paths.TSFull, zipWrapperDir, {
      // ℹ️ Exclude node_modules & public dir from being copied
      filter: src => !/\b(node_modules|public)\b/.test(src),
    })

    const zipPath = path.join(
      this.templateConfig.laravel.paths.TSFull,
      `${this.templateConfig.laravel.pkgName}${isStaging ? '-staging' : ''}.zip`,
    )

    // Generate zip of ts full including demo & laravel
    execCmd(`zip -rq ${zipPath} .`, { cwd: zipWrapperDirParent })

    // Reset changes in .env file
    writeFileSyncUTF8(envPath, envContent)

    // Reset changes we done via git checkout
    // Thanks: https://stackoverflow.com/a/21213235/10796681
    execCmd('git status >/dev/null 2>&1 && git checkout .', { cwd: this.templateConfig.laravel.paths.TSFull })
  }
}
