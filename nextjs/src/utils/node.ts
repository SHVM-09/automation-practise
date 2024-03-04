import type { ExecOptions } from 'child_process'
import { exec } from 'child_process'
import { consola } from 'consola'
import { colorize } from 'consola/utils'
import process from 'process'

export async function execCmd(command: string): Promise<{ stdout: string; stderr: string }>
export async function execCmd(command: string, options: ExecOptions): Promise<{ stdout: string; stderr: string }>

export async function execCmd(command: string, options?: ExecOptions) {
  return await new Promise(resolve => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        consola.error(error)

        console.log(colorize('red', String(stdout)))

        // Stop execution
        process.exit(1)
      }

      if (stderr) {
        consola.warn(stderr)
      }

      resolve({ stdout, stderr })
    })
  })
}
