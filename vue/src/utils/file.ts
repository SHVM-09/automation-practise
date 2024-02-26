import '@/utils/injectMustReplace'
import path from 'node:path'
import type { OversizedFileStats } from '@types'
import { consola } from 'consola'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import tinify from 'tinify'
import type { PackageJson } from 'type-fest'
import { TempLocation } from './temp'
import { execCmd, readFileSyncUTF8, updateFile } from '@/utils/node'

/**
 * Adds received import string as last import statement
 *
 * https://regex101.com/r/3NfiKn/2
 *
 * @param data data source to add import
 * @param importStatement import statement as string
 * @returns Returns modified data
 */

// https://regex101.com/r/ba5Vcn/2
export const addImport = (data: string, importStatement: string): string => {
  if (data.startsWith('import'))
    return data.mustReplace(/(import .*\n)(\n*)(?!import)/gm, `$1${importStatement}\n$2`)
  else
    return `${importStatement}\n\n${data}`
}

export const addSfcImport = (data: string, importStatement: string): string => {
  return data.mustReplace(/(<script.*)/gm, `$1\n${importStatement}\n\n`)
}

/**
 * Remove top level import statement from data
 * @param data data source to remove imports from
 * @returns Returns data without any imports
 */
export const removeAllImports = (data: string) => data.replace(/import .*\n\n?/gm, '')

// check file size and return array of files that are over the limit
export const getOverSizedFiles = (globPattern: string, maxSizeInKb = 100, ignorePatterns: string[] = []) => {
  const assets = globbySync(globPattern, { expandDirectories: true, ignore: ignorePatterns })

  const overSizedFiles: OversizedFileStats[] = []

  assets.forEach((file) => {
    const stats = fs.statSync(file)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / 1000
    if (fileSizeInMegabytes > maxSizeInKb)
      overSizedFiles.push({ filePath: file, size: fileSizeInMegabytes })
  })

  return overSizedFiles
}

const getFilesStrList = (files: { filePath: string; size: number }[], reportPathRelativeTo?: string) => {
  return files.map((f) => {
    const filePath = reportPathRelativeTo
      ? path.relative(reportPathRelativeTo, f.filePath)
      : f.filePath

    return `\n${filePath} (${f.size}KB)`
  }).join('')
}

export const reportOversizedFiles = async (globPattern: string, isInteractive: boolean, options: { reportPathRelativeTo?: string; maxSizeInKb?: number; ignorePatterns?: string[] } = {}) => {
  const { reportPathRelativeTo, maxSizeInKb = 100, ignorePatterns } = options
  const overSizedFiles = getOverSizedFiles(globPattern, maxSizeInKb, ignorePatterns)

  if (overSizedFiles.length) {
    const filesStr = getFilesStrList(overSizedFiles, reportPathRelativeTo)

    if (!isInteractive) {
      consola.info('Skipping due to non-interactive mode. Please optimize the following images: \n', filesStr)
      return
    }

    const tempDir = new TempLocation().tempDir

    overSizedFiles.forEach((f) => {
      fs.copySync(f.filePath, path.join(tempDir, path.basename(f.filePath)))
    })
    consola.info(`Large images copied to ${tempDir}`)

    const shouldIgnoreOversizedFiles = await consola.prompt(`Below files are still oversized even after compression would you like to continue?\n${filesStr}`, {
      type: 'confirm',
    })

    if (!shouldIgnoreOversizedFiles)
      throw consola.error(new Error(`Please optimize (<${maxSizeInKb}kb) the following images: \n${filesStr}\n`))
  }
}

export const compressOverSizedFiles = async (globPattern: string, isInteractive: boolean, options: { reportPathRelativeTo?: string; maxSizeInKb?: number; ignorePatterns?: string[] } = {}): Promise<OversizedFileStats[]> => {
  dotenv.config()

  const { reportPathRelativeTo, maxSizeInKb = 100, ignorePatterns } = options
  const overSizedFiles = getOverSizedFiles(globPattern, maxSizeInKb, ignorePatterns)

  if (!overSizedFiles.length)
    return []

  const filesStr = getFilesStrList(overSizedFiles, reportPathRelativeTo)

  consola.box(`🐼 Compressing following files with TinyPNG:\n${filesStr}`)
  tinify.key = process.env.TINY_PNG_API_KEY || ''
  for (const f of overSizedFiles)
    await tinify.fromFile(f.filePath).toFile(f.filePath)

  consola.success('File compression done, Thanks 🐼')

  consola.info('Checking for oversized files again...')
  await reportOversizedFiles(globPattern, isInteractive, options)

  consola.success('All files are optimized 🎉')

  // ℹ️ We are returning the overSizedFiles but they are already optimized so you can use them for other purposes like commiting them to git
  return overSizedFiles
}

export const getPackagesVersions = (tsFullPath: string): PackageJson.Dependency => {
  // Run the pnpm list command and capture its output
  const output = execCmd('pnpm list --depth=0', {
    cwd: tsFullPath,
  })?.toString()

  // Define a regular expression to match package names and versions
  const pattern = /├─ (.*)@(.*)/

  // Split the output into lines and filter out empty lines
  const lines = output?.trim().split('\n').filter(line => line)

  const packages: PackageJson.Dependency = {}

  // Map the lines to objects containing the package name and version
  lines?.forEach((line) => {
    const matches = line.match(pattern)

    if (matches)
      packages[matches[1]] = matches[2]
  })

  return packages
}

export const pinPackagesVersions = (packageVersions: PackageJson.Dependency, tempDirPath: string) => {
  const packageObj: PackageJson = fs.readJsonSync(`${tempDirPath}/package.json`)

  const pkgDeps = packageObj.dependencies as PackageJson.Dependency
  const pkgDevDeps = packageObj.devDependencies as PackageJson.Dependency

  Object.entries(packageVersions).forEach(([packageName, packageVersion]) => {
    if (pkgDeps[packageName])
      pkgDeps[packageName] = packageVersion

    if (pkgDevDeps[packageName])
      pkgDevDeps[packageName] = packageVersion
  })

  fs.writeJsonSync(`${tempDirPath}/package.json`, packageObj, { spaces: 2 })
}

export const genRedirectionHtmlFileContent = (placeholders: { templateFullName: string; url: string }) => {
  return `<!DOCTYPE html>
<html>

<head>
  <title>${placeholders.templateFullName}</title>
  <meta http-equiv="refresh" content="0; URL='${placeholders.url}'" />
</head>

<body>
  <p>If you do not redirect please visit : <a href="${placeholders.url}">${placeholders.url}</a></p>
</body>

</html>`
}

export const genRedirectionHtmlFile = (filePath: string, placeholders: Parameters<typeof genRedirectionHtmlFileContent>[0]) => {
  fs.writeFileSync(filePath, genRedirectionHtmlFileContent(placeholders))
}

export const mergeEnvFiles = (sourceFilePath: string, targetFilePath: string) => {
  updateFile(
    targetFilePath,
    (data) => {
      const sourceEnv = dotenv.parse(data)
      const targetEnv = dotenv.parse(readFileSyncUTF8(sourceFilePath))

      const mergedEnv = { ...targetEnv, ...sourceEnv }

      return Object.entries(mergedEnv).map(([key, value]) => `${key}=${value}`).join('\n')
    },
  )
}
