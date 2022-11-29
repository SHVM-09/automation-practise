import type { ExecSyncOptions, ExecSyncOptionsWithStringEncoding } from 'child_process'
import { execSync } from 'child_process'
import chalk from 'chalk'
import fs from 'fs-extra'

export function execCmd(command: string): Buffer | undefined
export function execCmd(command: string, options: ExecSyncOptionsWithStringEncoding): string | undefined
export function execCmd(command: string, options: ExecSyncOptionsWithStringEncoding): Buffer | undefined
export function execCmd(command: string, options?: ExecSyncOptions): string | Buffer | undefined
export function execCmd(command: string, options?: ExecSyncOptions): string | Buffer | undefined {
  try {
    return execSync(command, options)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (err: any) {
    console.log(chalk.redBright('Error:', err))
    console.log(chalk.redBright('message:', err.message))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.log(chalk.redBright('stdout:', err.stdout.toString()))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.log(chalk.redBright('sdtErr: ', err.stderr.toString()))

    return undefined
  }
}

export type UpdateFileModifier = (data: string) => string

export const readFileSyncUTF8 = (path: string) => fs.readFileSync(path, { encoding: 'utf-8' })
export const writeFileSyncUTF8 = (path: string, data: string) => fs.writeFileSync(path, data, { encoding: 'utf-8' })

/**
 * This is helper function to read the file content by given path.
 * 2nd argument is callback function to modify the content of file. Return modified data as string to write it back to given path.
 * @param path File path to read from & write to
 * @param modifier Function that modifies the file data
 */
export const updateFile = (path: string, modifier: UpdateFileModifier) => {
  fs.writeFileSync(
    path,
    modifier(fs.readFileSync(path, { encoding: 'utf-8' })),
    { encoding: 'utf-8' },
  )
}

export const replaceDir = (src: string, dest: string) => {
  fs.removeSync(dest)
  fs.copySync(src, dest)
}

export const removeEmptyDirsRecursively = (path: string) => {
  execCmd(`find ${path} -type d -empty -delete`)
}
