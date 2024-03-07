import consola from 'consola'
import fs from 'fs-extra'
import path from 'path'
import type { TemplateRepoName } from './configs/getPaths'
import type { TemplateConfig } from './configs/templateConfig'
import getTemplateName from './utils/getTemplateName'
import { getTemplateRepoPaths } from './configs/getPaths'
import { getJsRootPath, getTsRootPath, getTsVersionPath } from './utils/templatePathUtils'
import { compressOverSizedFiles } from './utils/compressImageFiles'
import { templateConfig } from './configs/templateConfig'
import { updatePackagesVersions } from './utils/updatePackageJsonVersions'
import { execCmd } from './utils/node'
import { copyDirectory } from './utils/copyDir'
import { addChangelogFile } from './package/addChangelogFile'
import { removeBuyNowButton } from './utils/removeBuyNowButton'
import { updateEnvFiles } from './package/updateEnvFiles'
import { removeTestPages } from './utils/removeTestPages'
import { updateIconBundleScript } from './package/updateIconBundleScript'
import { installLintFormat } from './package/installLintFormat'

const main = async (): Promise<void> => {
  // Vars
  const templateName: TemplateRepoName = await getTemplateName()
  const templateDir = getTemplateRepoPaths[templateName]
  const tsRootDir = getTsRootPath(templateName)
  const jsRootDir = getJsRootPath(templateName)
  const tsFullDir = getTsVersionPath(templateName, 'full-version')

  let isMarketplace = false
  let isPixinvent = false

  if (templateName === 'materio') {
    isMarketplace = await consola.prompt('Is this a marketplace package?', { type: 'confirm', initial: false })
  }

  if (templateName === 'materialize' || templateName === 'vuexy') {
    isPixinvent = true
  }

  // ────────────── Compress OverSized Files ──────────────
  await compressOverSizedFiles(`${tsFullDir}/public/images`, {
    reportPathRelativeTo: tsFullDir,
    ignorePatterns: templateConfig[templateName]?.ignoreCompressionPatterns
  })

  // ────────────── Update Packages according to node_modules ──────────────
  await updatePackagesVersions(tsFullDir)

  // ────────────── Generate TS Starter Kit ──────────────
  consola.start('Generating TypeScript Starter Kit...')
  await execCmd(`tsx ./src/generateStarterKit.ts ${templateName}`)
  consola.success('Generated TypeScript Starter Kit successfully!\n')

  // ────────────── Generate JavaScript Versions ──────────────
  consola.start('Generating JavaScript Versions...')
  await execCmd(`tsx ./src/generateTsToJs.ts --templateName ${templateName} --templateVersion both`)
  consola.success('Generated JavaScript Versions successfully!\n')

  // ────────────── Create Package Directory ──────────────
  const tempPkgDir = path.join(templateDir, 'package')

  // check if package directory exists
  if (await fs.pathExists(tempPkgDir)) {
    await fs.remove(tempPkgDir)
  }

  // Create package directory
  await fs.ensureDir(tempPkgDir)

  consola.start(`Creating package at ${tempPkgDir}`)
  const tempPkgTsDir = path.join(tempPkgDir, 'typescript-version')
  const tempPkgTsFullDir = path.join(tempPkgTsDir, 'full-version')
  const tempPkgTsSkDir = path.join(tempPkgTsDir, 'starter-kit')
  const tempPkgJsDir = path.join(tempPkgDir, 'javascript-version')
  const tempPkgJsFullDir = path.join(tempPkgJsDir, 'full-version')
  const tempPkgJsSkDir = path.join(tempPkgJsDir, 'starter-kit')

  // Create directories
  await fs.ensureDir(tempPkgTsDir)
  await fs.ensureDir(tempPkgJsDir)

  // ────────────── Copy Files to Package Directory ──────────────
  consola.start('Copying files to package directory...')
  await copyDirectory(tsRootDir, tempPkgTsDir, templateConfig[templateName]?.packageIgnoreCopyPatterns)
  await copyDirectory(jsRootDir, tempPkgJsDir, templateConfig[templateName]?.packageIgnoreCopyPatterns)
  await fs.copyFile(path.join(templateDir, 'documentation.html'), path.join(tempPkgDir, 'documentation.html'))

  if (!isPixinvent) {
    await fs.copyFile(path.join(templateDir, 'hire-us.html'), path.join(tempPkgDir, 'hire-us.html'))
    await addChangelogFile(tempPkgDir, templateConfig[templateName] as TemplateConfig)
  }

  consola.success('Copied files to package directory successfully!\n')

  // ────────────── Remove Buy Now Button ──────────────
  // params: directory, buyNowDir, layoutDir
  await removeBuyNowButton(tempPkgTsFullDir, 'src/components/buy-now-button', 'src/app/[lang]/layout.tsx')
  await removeBuyNowButton(tempPkgJsFullDir, 'src/components/buy-now-button', 'src/app/[lang]/layout.jsx')

  // ────────────── Update env files ──────────────
  // params: templateName, templateDir, isMarketplace
  await updateEnvFiles(templateName, tempPkgTsFullDir, isMarketplace)
  await updateEnvFiles(templateName, tempPkgJsFullDir, isMarketplace)

  // ────────────── Remove test pages ──────────────
  await removeTestPages(tempPkgTsFullDir)
  await removeTestPages(tempPkgJsFullDir)

  // ────────────── Remove Caret and Tilde from package.json ──────────────
  consola.start('Removing caret and tilde from all package.json files...')
  const dirArray = [tempPkgTsFullDir, tempPkgTsSkDir, tempPkgJsFullDir, tempPkgJsSkDir]

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dirArray.forEach(async dir => {
    await execCmd(`sd '": "(\\^|\\~)' '": "' ${dir}/package.json`)
  })
  consola.success('Removed caret and tilde from all package.json files successfully!\n')

  // ────────────── Update icon bundle script ──────────────
  consola.start('Updating icon bundle scripts...')

  const iconBundleArray = [
    path.join(tempPkgTsFullDir, 'src/assets/iconify-icons/bundle-icons-css.ts'),
    path.join(tempPkgTsSkDir, 'src/assets/iconify-icons/bundle-icons-css.ts'),
    path.join(tempPkgJsFullDir, 'src/assets/iconify-icons/bundle-icons-css.js'),
    path.join(tempPkgJsSkDir, 'src/assets/iconify-icons/bundle-icons-css.js')
  ]

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  iconBundleArray.forEach(async filePath => {
    await updateIconBundleScript(filePath)
  })
  await updateIconBundleScript(path.join(tempPkgTsFullDir, 'src/assets/iconify-icons/bundle-icons-css.ts'))
  consola.success('Updated icon bundle scripts successfully!\n')

  // ────────────── Install node_modules and run for linting & formatting ──────────────
  await installLintFormat(tempPkgTsFullDir)
  await installLintFormat(tempPkgTsSkDir)
  await installLintFormat(tempPkgJsFullDir)
  await installLintFormat(tempPkgJsSkDir)

  // ────────────── Remove icon generated files ──────────────
  consola.start('Removing icon generated files...')

  const iconGeneratedFileArray = [
    path.join(tempPkgTsFullDir, 'src/assets/iconify-icons/generated-icons.css'),
    path.join(tempPkgTsSkDir, 'src/assets/iconify-icons/generated-icons.css'),
    path.join(tempPkgJsFullDir, 'src/assets/iconify-icons/generated-icons.css'),
    path.join(tempPkgJsSkDir, 'src/assets/iconify-icons/generated-icons.css')
  ]

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  iconGeneratedFileArray.forEach(async iconGeneratedFile => {
    await execCmd(`rm -rf ${iconGeneratedFile}`)
  })
  consola.success('Removed icon generated files successfully!')
}

main().catch(error => {
  consola.error(`An error occurred: ${error}`)
})
