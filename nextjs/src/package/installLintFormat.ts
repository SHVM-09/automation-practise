import { execCmd } from '../utils/node'
import consola from 'consola'

export const installLintFormat = async (directory: string) => {
  consola.start(`Installing node_modules and running for linting & formatting in ${directory}...`)

  // Change directory to the directory
  process.chdir(directory)

  // Remove pnpm-lock.yaml
  await execCmd('rm -rf pnpm-lock.yaml')

  await execCmd('pnpm install')
  await execCmd('pnpm lint:fix')
  await execCmd('pnpm format')

  consola.success('Installed node_modules and ran for linting & formatting successfully!\n')

  // ────────────── Remove node_modules and .next directories ──────────────
  consola.start('Removing node_modules and .next directories...')

  await execCmd('rm -rf .next node_modules')
  consola.success('Removed node_modules and .next directories successfully!\n')
}
