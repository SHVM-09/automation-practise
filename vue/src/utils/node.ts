import type { Buffer } from 'node:buffer'
import type { ExecOptions, ExecSyncOptions, ExecSyncOptionsWithBufferEncoding, ExecSyncOptionsWithStringEncoding } from 'node:child_process'
import { exec, execSync } from 'node:child_process'
import process from 'node:process'
import readline from 'node:readline'
import fs from 'fs-extra'
import { colorize } from 'consola/utils'
import { consola } from 'consola'

export function execCmd(command: string): Buffer
export function execCmd(command: string, options: ExecSyncOptionsWithBufferEncoding): Buffer
export function execCmd(command: string, options: ExecSyncOptionsWithStringEncoding): string
export function execCmd(command: string, options?: ExecSyncOptions): void
export function execCmd(command: string, options?: ExecSyncOptions | ExecSyncOptionsWithStringEncoding | ExecSyncOptionsWithBufferEncoding) {
  try {
    return execSync(command, options)
  }
  catch (err) {
    consola.error(err)

    // @ts-expect-error I know what I'm doing
    console.log(colorize('red', String(err.stdout)))

    // Stop execution
    process.exit(1)
  }
}

export function execCmdAsync(command: string): Promise<{ stdout: string; stderr: string }>
export function execCmdAsync(command: string, options: ExecOptions): Promise<{ stdout: string; stderr: string }>
export function execCmdAsync(command: string, options?: ExecOptions) {
  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        consola.error(error)
        // Stop execution
        process.exit(1)
      }
      if (stderr)
        consola.warn(stderr)

      resolve({ stdout, stderr })
    })
  })
}

export type UpdateFileModifier = (data: string) => string

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UpdateJSONFileModifier = (data: Record<string, any>) => Record<string, any>

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

export const filterFileByLine = (path: string, filter: (value: string, index: number, array: string[]) => boolean) => {
  updateFile(path, data => data.split('\n').filter(filter).join('\n'))
}

// TODO: use this utility function
export const updateJSONFile = (path: string, modifier: UpdateJSONFileModifier, spaces = 2) => {
  fs.writeJSONSync(
    path,
    modifier(fs.readJSONSync(path)),
    { spaces },
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateJSONFileField = (path: string, key: string, value: any, spaces = 2) => {
  updateJSONFile(path, (data) => {
    data[key] = value

    return data
  }, spaces)
}

export const replaceDir = (src: string, dest: string) => {
  fs.removeSync(dest)
  fs.copySync(src, dest)
}

export const removeEmptyDirsRecursively = (path: string) => {
  execCmd(`find ${path} -type d -empty -delete`)
}

export const ask = (que: string) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  return new Promise<string>(resolve => rl.question(que, (ans) => {
    rl.close()
    resolve(ans)
  }))
}

export async function downloadFile(url: string, token: string) {
  // Fake sleep via promise and setTimeout
  await new Promise(resolve => setTimeout(resolve, 2000))

  throw new Error('Not implemented yet')
}

// TODO: Create util filterLine
