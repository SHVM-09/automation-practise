import '@/utils/injectMustReplace'
import path from 'path'
import type { OversizedFileStats } from '@types'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import tinify from 'tinify'
import type { PackageJson } from 'type-fest'
import { execCmd } from '@/utils/node'
import { error, info, success } from '@/utils/logging'
/**
   * Adds received import string as last import statement
   *
   * https://regex101.com/r/3NfiKn/2
   *
   * @param data data source to add import
   * @param importStatement import statement as string
   * @returns Returns modified data
   */
export const addImport = (data: string, importStatement: string) => data.mustReplace(/(import .*\n)(\n*)(?!import)/gm, `$1${importStatement}\n$2`)

// https://regex101.com/r/ba5Vcn/2
export const addVitePlugin = (data: string, pluginConfig: string, insertTrailingComma = true) => data.mustReplace(/(( +)plugins:\s*\[)/gm, `$1\n$2$2${pluginConfig}${insertTrailingComma ? ',' : ''}`)

// check file size and return array of files that are over the limit
export const getOverSizedFiles = (globPattern: string, maxSizeInKb = 100) => {
  const assets = globbySync(globPattern, { expandDirectories: true })

  const overSizedFiles: OversizedFileStats[] = []

  assets.forEach((file) => {
    const stats = fs.statSync(file)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / 1000.0
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

    return `${filePath} (${f.size}KB)\n`
  }).join('')
}

export const reportOversizedFiles = (globPattern: string, options: { reportPathRelativeTo?: string; maxSizeInKb?: number } = {}) => {
  const { reportPathRelativeTo, maxSizeInKb = 100 } = options
  const overSizedFiles = getOverSizedFiles(globPattern, maxSizeInKb)

  if (overSizedFiles.length) {
    const filesStr = getFilesStrList(overSizedFiles, reportPathRelativeTo)

    error(`Please optimize (<${maxSizeInKb}kb) the following images: \n${filesStr}\n`)
  }
}

export const compressOverSizedFiles = async (globPattern: string, options: { reportPathRelativeTo?: string; maxSizeInKb?: number } = {}): Promise<OversizedFileStats[]> => {
  dotenv.config()

  const { reportPathRelativeTo, maxSizeInKb = 100 } = options
  const overSizedFiles = getOverSizedFiles(globPattern, maxSizeInKb)

  if (!overSizedFiles.length)
    return []

  const filesStr = getFilesStrList(overSizedFiles, reportPathRelativeTo)

  info(`🐼 Compressing following files with TinyPNG:\n${filesStr}`)
  tinify.key = process.env.TINY_PNG_API_KEY || ''
  for (const f of overSizedFiles)
    await tinify.fromFile(f.filePath).toFile(f.filePath)

  success('File compression done, Thanks 🐼')

  info('Checking for oversized files again...')
  reportOversizedFiles(globPattern, options)

  success('All files are optimized 🎉')

  // ℹ️ We are returning the overSizedFiles but they are already optimized so you can use them for other purposes like commiting them to git
  return overSizedFiles
}

export const getPackagesVersions = (tsFullPath: string): PackageJson.Dependency => {
  // Run the yarn list command and capture its output
  const output = execCmd('yarn list --depth=0', {
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
