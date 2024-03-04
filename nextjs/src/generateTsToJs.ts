import { defineCommand, runMain } from 'citty'
import fse from 'fs-extra'
import { consola } from 'consola'
import path from 'path'
import resetTsConfig from './ts-to-js/resetTsConfig'
import compileTsToJs from './ts-to-js/compileTsToJs'
import updateTsConfig from './ts-to-js/updateTsConfig'
import updatePackageJson from './ts-to-js/updatePackageJson'
import updateEslintRules from './ts-to-js/updateEslintRules'
import copyFilesFromTsToJs from './ts-to-js/copyFilesFromTsToJs'
import copyFoldersFromTsToJs from './ts-to-js/copyFoldersFromTsToJs'
import removeTypeFilesFolders from './ts-to-js/removeTypeFilesFolders'
import removeEslintTypeComments from './ts-to-js/removeEslintTypeComments'
import convertTsConfigToJsConfig from './ts-to-js/convertTsConfigToJsConfig'
import { getJsRootPath, getJsVersionPath, getTsRootPath, getTsVersionPath } from './utils/templatePathUtils'
import getTemplateName from './utils/getTemplateName'
import getTemplateVersion from './utils/getTemplateVersion'
import { execCmd } from './utils/node'
import { copyDirectory } from './utils/copyDir'

const convertTsToJs = async (templateName: string, templateVersion: string) => {
  // Vars
  const tsDir = getTsVersionPath(templateName, templateVersion)
  const jsDir = getJsVersionPath(templateName, templateVersion)

  // ────────────── Remove JS folder if exists ──────────────
  if (await fse.exists(jsDir)) {
    consola.info(`Removing existing  JavaScript's ${templateVersion} directory...`)
    await execCmd(`rm -rf ${jsDir}`)
    consola.success(`Removed existing JavaScript's ${templateVersion} directory successfully!\n`)
  }

  // ────────────── Update tsconfig to exclude folders ──────────────

  // Update tsconfig to exclude menu-examples and hook-example folders
  await updateTsConfig(tsDir)

  // ────────────── TypeScript to JavaScript ──────────────

  // Compile Typescript files to JavaScript files in a newly created javascript-version directory
  await compileTsToJs(templateName, templateVersion)

  // ────────────── Reset tsconfig to remove excluded folders ──────────────

  // Reset tsconfig to remove excluded menu-examples and hook-example folders and reset to exclude only node_modules
  await resetTsConfig(tsDir)

  // ────────────── Copy Files ──────────────

  // Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder javascript-version
  await copyFilesFromTsToJs(tsDir, jsDir)

  // ────────────── Copy Folders ──────────────

  // Copy .vscode & public, styles and prisma directories into javascript-version for assets and .vscode configurations
  await copyFoldersFromTsToJs(tsDir, jsDir)

  // ────────────── Remove Type Files & Folders ──────────────

  // Remove type files and folders from the javascript-version
  await removeTypeFilesFolders(jsDir)

  // ────────────── Update Eslint Rules ──────────────

  // Update eslint rules in javascript-version
  await updateEslintRules(jsDir)

  // ────────────── Update Package.json file ──────────────

  // Update package.json in javascript-version
  await updatePackageJson(jsDir)

  // ────────────── Generate JSConfig file ──────────────

  // Generate jsconfig.json in javascript-version
  await convertTsConfigToJsConfig(jsDir)

  // ────────────── Remove eslint type comments ──────────────

  // Remove eslint type comments in javascript-version
  await removeEslintTypeComments(jsDir)

  // ────────────── Install Node Modules ──────────────
  consola.start(`Install node modules in javascript-version's ${templateVersion} folder`)

  // Change to the JavaScript full-version folder
  process.chdir(jsDir)

  // Install node_modules in javascript's full-version folder
  await execCmd('pnpm install')

  consola.success('Installed node modules successfully!\n')

  // ────────────── Lint Files ──────────────

  // Run pnpm lint command to fix all the linting error and give space after imports
  consola.start('Run pnpm lint command to fix all the linting error and give space after imports')

  await execCmd('pnpm run lint:fix')

  consola.success('Linted all the files successfully!\n')

  // ────────────── Format Files ──────────────

  // Run pnpm format command to format all the files using prettier
  consola.start('Run pnpm format command to format all the files using prettier')

  await execCmd('pnpm run format')
  await execCmd('pnpm run lint:fix')

  consola.success('Formatted all the files successfully!\n')
}

const generateTsToJs = defineCommand({
  meta: {
    name: 'generate-ts-to-js'
  },
  args: {
    templateName: {
      type: 'string',
      description: 'template name',
      required: false
    },
    templateVersion: {
      type: 'string',
      description: 'template version',
      required: false
    }
  },
  async run({ args }) {
    let templateName = args.templateName
    let templateVersion = args.templateVersion

    if (templateName === undefined) {
      templateName = await getTemplateName()
    }

    if (templateVersion === undefined) {
      templateVersion = await (getTemplateVersion(templateName) as Promise<string>)
    }

    if (!templateName || !templateVersion) {
      consola.error('Template repo or version folder does not exist.')

      return
    }

    // ────────────── Convert TypeScript to JavaScript ──────────────
    if (templateVersion === 'both') {
      const tsRootDir = getTsRootPath(templateName)
      const jsRootDir = getJsRootPath(templateName)

      // Remove existing JavaScript directory
      if (await fse.exists(jsRootDir)) {
        consola.info('Removing existing JavaScript directory...')
        await execCmd(`rm -rf ${jsRootDir}`)
        consola.success('Removed existing JavaScript directory successfully!\n')
      }

      // Copy Demo Configs to TypeScript Full Version
      consola.start('Copying demo configs to TypeScript full version...')
      await copyDirectory(path.join(tsRootDir, 'demo-configs'), path.join(tsRootDir, 'full-version/demo-configs'))
      consola.success('Copied demo configs to TypeScript full version successfully!\n')

      console.log('\n')

      // Convert TypeScript Full Version to JavaScript Full Version
      consola.info('Converting full-version to JavaScript')
      await convertTsToJs(templateName, 'full-version')
      consola.success('Converted full-version to JavaScript successfully!\n')

      // Remove Demo Configs from TypeScript Full Version
      consola.start('Removing demo configs from TypeScript full version...')
      await execCmd(`rm -rf ${path.join(tsRootDir, 'full-version/demo-configs')}`)
      consola.success('Removed demo configs from TypeScript full version successfully!\n')

      // Move Demo Configs from JS Full Version to JS Root
      consola.start('Moving demo configs from JavaScript full version to JavaScript root...')
      await execCmd(`mv ${path.join(jsRootDir, 'full-version/demo-configs')} ${path.join(jsRootDir, 'demo-configs')}`)
      consola.success('Moved demo configs from JavaScript full version to JavaScript root successfully!\n')

      console.log('\n')

      consola.info('Converting starter-kit to JavaScript')
      await convertTsToJs(templateName, 'starter-kit')
      consola.success('Converted starter-kit to JavaScript successfully!')
    } else {
      await convertTsToJs(templateName, templateVersion)
    }
  }
})

runMain(generateTsToJs)
