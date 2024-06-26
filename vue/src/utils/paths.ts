import path from 'node:path'
import * as url from 'node:url'
import { removeTrailingAndLeadingSlashes } from './string'

// const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// projectRoot => automation-scripts/vue
export const projectPath = path.join(__dirname, '..', '..')

// repoRoot => automation-scripts
export const repoPath = path.join(projectPath, '..')

export const getTemplatePath = (name: string, technology: string) => path.join(repoPath, '..', name, technology)

/**
 * Removes a prefix from a given path string.
 * Regex101: https://regex101.com/r/1MjJc8/4
 *
 * @param {string} path - The path string to remove the prefix from.
 * @param {string} prefix - The prefix to remove from the path string.
 * @returns {string} - The path string with the prefix removed.
 */
export const removePathPrefix = (path: string, prefix: string) => {
  const pathStr = `(^\.)?((?<=\.?)\/${prefix})|(${prefix}\/)`
  const pattern = new RegExp(`^${pathStr}|(?! )${pathStr}`, 'gm')

  return path.replace(pattern, '')
}

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
export const replacePath = (data: string, oldPath: string, newPath: string) => {
  const _oldPath = removeTrailingAndLeadingSlashes(oldPath)
  const _newPath = removeTrailingAndLeadingSlashes(newPath)

  // escape forward slashes
  const oldPathPattern = _oldPath.replace(/\//gm, '\\/')

  const pattern = new RegExp(`(\.?[\/]?)${oldPathPattern}\\b(\/|'|")`, 'gm')

  return data.replace(pattern, `$1${_newPath}$2`)
}
