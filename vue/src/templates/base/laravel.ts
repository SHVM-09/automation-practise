import path from 'path'
import * as url from 'url'
import fs from 'fs-extra'
import { globbySync } from 'globby'

import type { TemplateBaseConfig } from './config'
import { Utils, injectGTM } from './helper'

import { addImport, addVitePlugin } from '@/utils/file'
import '@/utils/injectMustReplace'
import { info, success } from '@/utils/logging'
import { execCmd, readFileSyncUTF8, replaceDir, updateFile, updateJSONFileField, writeFileSyncUTF8 } from '@/utils/node'
import { getTemplatePath, replacePath } from '@/utils/paths'
import { TempLocation } from '@/utils/temp'
import { generateDocContent, updatePkgJsonVersion } from '@/utils/template'

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
        .mustReplace(/<\/head>/, `  @vite(['resources/${lang}/main.${lang}'])\n</head>`)

        // use laravel's asset helper
        .mustReplace(/\/(favicon\.ico|loader.css|logo.png)/g, '{{ asset(\'$1\') }}'),
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

  /**
   * TODO: This is duplicated from base/genDemo.ts
   * Modifies the files to attach the demo-$number pattern to make all demos unique
   * This is used to isolate the demo config
   * @param demoNumber localStorage key to update for demo
   */
  private updateLocalStorageKeys(demoNumber: number, templateName: string) {
    // default values for demo 1
    let sedFind = '(localStorage.(set|get|remove)Item\\(.*\\.title\\}-)'
    let sedReplace = '\\1vue-laravel-demo-1-'

    // ❗ In below regex we didn't used \w because mac sed can't recognize it hence we have to use [a-zA-Z]
    const sedFindAuthKeys = '(localStorage.(set|get|remove)Item\\(\')([a-zA-Z]+)'
    const sedReplaceAuthKeys = `\\1${this.templateConfig.templateName}-vue-laravel-\\3`

    let indexHTMLFind = new RegExp(`(localStorage\.getItem\\('${templateName})`, 'g')
    let indexHTMLReplace = '$1-vue-laravel-demo-1'

    // If it's not 1st demo update the find replace strings
    if (demoNumber !== 1) {
      const findStr = (() => `demo-${demoNumber - 1}`)()
      const replaceStr = `demo-${demoNumber}`

      sedFind = findStr
      sedReplace = replaceStr

      indexHTMLFind = new RegExp(findStr, 'g')
      indexHTMLReplace = replaceStr
    }
    else {
      /*
        As we want to update the auth keys just once, we will update only when generating first demo
        ℹ️ Prefix auth keys with <template-name>-vue-

        https://stackoverflow.com/a/39382621/10796681
        https://unix.stackexchange.com/a/15309/528729

        find ./src \( -iname \*.vue -o -iname \*.ts -o -iname \*.tsx -o -iname \*.js -o -iname \*.jsx \) -type f -exec sed -i "" -r -e "s/(localStorage.(set|get|remove)Item\(')([a-zA-Z]+)/\1Materio-vue-\3/g" {} \;

        ❗ As `sed` command work differently on mac & ubuntu we need to add empty quotes after -i on mac
      */
      execCmd(
        `find ./resources \\( -iname \\*.vue -o -iname \\*.ts -o -iname \\*.tsx -o -iname \\*.js -o -iname \\*.jsx \\) -type f -exec sed -i ${process.platform === 'darwin' ? '""' : ''} -r -e "s/${sedFindAuthKeys}/${sedReplaceAuthKeys}/g" '{}' \\;`,
        { cwd: this.templateConfig.laravel.paths.TSFull },
      )
    }

    /*
      Linux command => find ./src \( -iname \*.vue -o -iname \*.ts -o -iname \*.tsx -o -iname \*.js -o -iname \*.jsx \) -type f -exec sed -i "" -r -e "s/(localStorage.(set|get|remove)Item\(.*\.title\}-)/\1demo-1-/g" {} \;
    */
    execCmd(
      `find ./resources \\( -iname \\*.vue -o -iname \\*.ts -o -iname \\*.tsx -o -iname \\*.js -o -iname \\*.jsx \\) -type f -exec sed -i ${process.platform === 'darwin' ? '""' : ''} -r -e "s/${sedFind}/${sedReplace}/g" '{}' \\;`,
      { cwd: this.templateConfig.laravel.paths.TSFull },
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
    updateFile(deployLaravelDemosWorkflowFilePath, data => data.mustReplace(/materio/g, this.templateConfig.templateName.toLowerCase()))

    // ℹ️ Only add release laravel workflow if template is for themeselection
    if (this.templateConfig.templateDomain === 'ts') {
      const releaseWorkflowSourceFilePath = path.join(baseDataDirPath, 'release-laravel.yml')
      const releaseWorkflowFilePath = path.join(ghWorkflowsDir, path.basename(releaseWorkflowSourceFilePath))
      // copy file from data to github workflow dir
      fs.copyFileSync(
        releaseWorkflowSourceFilePath,
        releaseWorkflowFilePath,
      )
      updateFile(releaseWorkflowFilePath, data => data.mustReplace(/materio/g, this.templateConfig.templateName.toLowerCase()))
    }
  }

  private updateRepoRootFiles() {
    const pkgJsonPath = path.join(this.templateConfig.laravel.projectPath, 'package.json')
    const gitIgnorePath = path.join(this.templateConfig.laravel.projectPath, '.gitignore')
    const masterVuePath = getTemplatePath('master', 'vue')

    // ❗ Only update root package.json & .gitignore if master vue dir exist
    // ℹ️ This will make cloning master vue repo optional when generating pkg in release github action
    if (!fs.pathExistsSync(masterVuePath)) {
      info('master vue doesn\'t exist. Omitting updating root package.json & gitignore')
      return
    }

    // Update root package.json file
    fs.copyFileSync(
      path.join(masterVuePath, 'package.json'),
      pkgJsonPath,
    )

    // if repo is for pixinvent
    if (this.templateConfig.templateDomain === 'pi')
      // Update release command => Remove prompt for changing CHANGELOG.md
      updateFile(pkgJsonPath, data => data.mustReplace(/(?<="release": ").*(?=yarn bumpp)/, ''))

    // Update root package.json file
    fs.copyFileSync(
      path.join(masterVuePath, '.gitignore'),
      gitIgnorePath,
    )
  }

  private genLaravel(options?: { isSK?: boolean; isJS?: boolean }) {
    /*
      ℹ️ Even though constructor of this class assigns the temp dir to the class we have to reinitialize the temp dir
      because `genLaravel` method is called multiple times after initializing the class once
    */
    this.initializePaths()

    const { isSK = false, isJS = false } = options || {}

    const sourcePath = isJS
      ? isSK
        ? this.templateConfig.paths.jSStarter
        : this.templateConfig.paths.jSFull
      : isSK
        ? this.templateConfig.paths.tSStarter
        : this.templateConfig.paths.tSFull

    const lang: Lang = isJS ? 'js' : 'ts'
    const langConfigFile: LangConfigFile = lang === 'ts' ? 'tsconfig.json' : 'jsconfig.json'

    // create new laravel project
    this.bootstrapLaravelInTempDir(lang, sourcePath)

    this.copyVueProjectFiles(lang, sourcePath)

    if (!isJS) {
      const filesToRemove = globbySync(
        '*.js',
        {
          cwd: path.join(this.resourcesPath, lang, '@iconify'),
          absolute: true,
        },
      )

      filesToRemove.forEach(filePath => fs.removeSync(filePath))
    }

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
    ;[...(lang === 'ts' ? ['components.d.ts'] : []), '.eslintrc.js', '.gitignore', langConfigFile, `vite.config.${lang}`].forEach((fileName) => {
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

    // ❗ We are moving images before doing `yarn` because we have postinstall script that can generate SVG based on iconify-svg dir and this dir is in images
    this.moveImages(lang, langConfigFile)

    // install packages
    execCmd('yarn', { cwd: this.projectPath })

    this.useStylesDir(lang, langConfigFile)

    // execCmd('git init && git add . && git commit -m init', { cwd: this.projectPath })

    const replaceDest = (() => {
      const paths = this.templateConfig.laravel.paths
      // If generating JS for free version => Replace with free JS
      // if (this.isFree)
      //   return freeJSPath

      if (isJS)
        return isSK ? paths.JSStarter : paths.JSFull
      else
        return isSK ? paths.TSStarter : paths.TSFull
    })()

    // Make sure dest dir exist. This is useful if we are generating laravel for first time.
    fs.ensureDirSync(replaceDest)

    // Place temp dir content in js full version
    replaceDir(this.projectPath, replaceDest)
  }

  async genPkg(isInteractive = true, newPkgVersion?: string) {
    // Generate Laravel TS Full
    this.genLaravel()

    // Generate Laravel TS Starter
    this.genLaravel({ isSK: true })

    // Generate Laravel JS Full
    this.genLaravel({ isJS: true })

    // Generate Laravel JS Starter
    this.genLaravel({
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

    // Remove BuyNow from both full versions
    // TODO: removeBuyNow method is not generic
    ;[tempPkgTSFull, tempPkgJSFull].forEach((projectPath, index) => {
      updateFile(
        path.join(projectPath, 'resources', index === 0 ? 'ts' : 'js', 'App.vue'),
        app => app.split('\n')
          .filter(line => !line.includes('BuyNow'))
          .join('\n'),
      )
    })
    // this.removeBuyNow(tempPkgTSFull)
    // this.removeBuyNow(tempPkgJSFull)

    // Create documentation.html file
    fs.writeFileSync(
      path.join(tempPkgDir, 'documentation.html'),
      generateDocContent(this.templateConfig.laravel.documentation.pageTitle, this.templateConfig.laravel.documentation.docUrl),
    )

    // package.json files paths in all four versions
    const pkgJsonPaths = [tempPkgTSFull, tempPkgTSStarter, tempPkgJSFull, tempPkgJSStarter].map(p => path.join(p, 'package.json'))

    // update package name in package.json
    pkgJsonPaths.forEach((pkgJSONPath) => {
      updateJSONFileField(pkgJSONPath, 'name', this.templateConfig.laravel.pkgName)
    })

    if (isInteractive || newPkgVersion)
      await updatePkgJsonVersion(pkgJsonPaths, path.join(tempPkgTSFull, 'package.json'), newPkgVersion)

    const zipPath = path.join(
      this.templateConfig.laravel.projectPath,
      `${this.templateConfig.laravel.pkgName}.zip`,
    )

    execCmd(`zip -rq ${zipPath} .`, { cwd: tempPkgDir })
    success(`✅ Package generated at: ${zipPath}`)
  }

  genDemos(isStaging: boolean) {
    info('isStaging: ', isStaging.toString())

    const { TSFull } = this.templateConfig.laravel.paths
    const envPath = path.join(this.templateConfig.laravel.paths.TSFull, '.env')
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
        .mustReplace(/(?<=^\$app.*\n)/gm, `\n$app->bind('path.public', function() { return base_path('../../html${this.templateConfig.laravel.demoPathOnServer(1, isStaging)}'); });\n`)
    })

    const themeConfigPath = path.join(TSFull, 'themeConfig.ts')
    const themeConfig = fs.readFileSync(themeConfigPath, { encoding: 'utf-8' })

    this.templateConfig.demosConfig.forEach((demoConfig, demoIndex) => {
      // Generate demo number
      const demoNumber = demoIndex + 1

      info(`Generating demo ${demoNumber}`)

      // ℹ️ If demo isn't first demo => Update thw demo-<demoNumber> in index.php file
      if (demoIndex)
        updateFile(indexPhpPath, data => data.mustReplace(/demo-\d+/g, `demo-${demoNumber}`))

      info('Updating localStorage keys...')
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
          .mustReplace(/(APP_URL=.*)(\nASSET_URL=.*)?/, `$1\nASSET_URL=${demoDeploymentBase}`),
      )

      updateFile(
        path.join(this.templateConfig.laravel.paths.TSFull, 'resources', 'ts', 'router', 'index.ts'),
        data => data.mustReplace(/(?<=createWebHistory\()(.*)(?=\))/, `'${demoDeploymentBase}'`),
      )

      // Run build
      execCmd('yarn build', { cwd: this.templateConfig.laravel.paths.TSFull })

      // At the moment of this script execution, we will have "public" in root the TSFull
      // Duplicate public to demo-$demoNumber
      fs.copySync(
        path.join(this.templateConfig.laravel.paths.TSFull, 'public'),
        path.join(this.templateConfig.laravel.paths.TSFull, `demo-${demoNumber}`),
      )

      // Reset the themeConfig
      fs.writeFileSync(themeConfigPath, themeConfig, { encoding: 'utf-8' })

      success(`✅ Demo ${demoNumber} generation completed`)
    })

    // Remove node_modules & public dir
    // ;['node_modules', 'public'].forEach((dirName) => {
    //   fs.removeSync(path.join(this.templateConfig.laravel.paths.TSFull, dirName))
    // })

    // Remove ASSET_URL as we don't want it in laravel core
    updateFile(envPath, data => data.mustReplace(/ASSET_URL=.*/, ''))

    info('Creating zip...')

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
      `${this.templateConfig.laravel.pkgName}${isStaging ? '-staging' : ''}.zip `,
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
