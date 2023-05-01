import '@/utils/injectMustReplace'
import path from 'path'
import type { OversizedFileStats } from '@types'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'
import { globbySync } from 'globby'
import tinify from 'tinify'
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
