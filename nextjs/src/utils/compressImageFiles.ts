import fs from 'fs'
import path from 'path'
import { globbySync } from 'globby'
import dotenv from 'dotenv'
import consola from 'consola'
import tinify from 'tinify'

export interface OversizedFileStats {
  filePath: string
  size: number
}

/**
 * Retrieves a list of oversized files based on the given glob pattern and maximum file size.
 * @param globPattern - The glob pattern to match files.
 * @param maxSizeInKb - The maximum file size in kilobytes. Defaults to 100KB.
 * @param ignorePatterns - An array of glob patterns to ignore files.
 * @returns An array of oversized file stats.
 */
export const getOverSizedFiles = (
  globPattern: string,
  maxSizeInKb = 100,
  ignorePatterns: string[] = []
): OversizedFileStats[] => {
  const assets = globbySync(globPattern, { expandDirectories: true, ignore: ignorePatterns })

  const overSizedFiles: OversizedFileStats[] = []

  assets.forEach(file => {
    const stats = fs.statSync(file)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / 1000

    if (fileSizeInMegabytes > maxSizeInKb) {
      overSizedFiles.push({ filePath: file, size: fileSizeInMegabytes })
    }
  })

  return overSizedFiles
}

/**
 * Retrieves a string list of oversized files.
 * @param files - An array of oversized file stats.
 * @param reportPathRelativeTo - The path to the report file, relative to the current working directory.
 * @returns A string list of oversized files.
 */
const getFilesStrList = (files: OversizedFileStats[], reportPathRelativeTo?: string): string => {
  return files
    .map(f => {
      const filePath =
        reportPathRelativeTo !== null ? path.relative(reportPathRelativeTo as string, f.filePath) : f.filePath

      return `\n${filePath} (${f.size}KB)`
    })
    .join('')
}

/**
 * Compresses oversized files using the TinyPNG API.
 * @param globPattern - The glob pattern to match files.
 * @param options - The options object for compressing oversized files.
 * @returns A promise that resolves to an array of oversized file stats.
 */
export const compressOverSizedFiles = async (
  globPattern: string,
  options: { reportPathRelativeTo?: string; maxSizeInKb?: number; ignorePatterns?: string[] } = {}
): Promise<OversizedFileStats[]> => {
  dotenv.config()

  const { reportPathRelativeTo, maxSizeInKb = 100, ignorePatterns } = options
  const overSizedFiles = getOverSizedFiles(globPattern, maxSizeInKb, ignorePatterns)

  if (overSizedFiles.length === 0) {
    return []
  }

  const filesStr = getFilesStrList(overSizedFiles, reportPathRelativeTo)

  consola.box(`🐼 Compressing following files with TinyPNG:\n${filesStr}`)
  tinify.key = process.env.TINY_PNG_API_KEY ?? ''

  for (const f of overSizedFiles) {
    await tinify.fromFile(f.filePath).toFile(f.filePath)
  }

  consola.success('File compression done. Thanks 🐼\n')

  // ? We are returning the overSizedFiles but they are already optimized so you can use them for other purposes like committing them to git
  return overSizedFiles
}
