import type { PackageJson } from 'type-fest'
import fs from 'fs-extra'
import consola from 'consola'
import { execCmd } from './node'

export const getPackagesVersions = async (path: string): Promise<PackageJson.Dependency> => {
  // Run the pnpm list command and capture its output
  const output = await execCmd('pnpm list --depth=0 --json', { cwd: path })

  let lines: Record<string, Record<string, string>> = {}

  // Parse the output to get the package names and versions
  try {
    lines = JSON.parse(output?.stdout.trim())[0]?.dependencies
  } catch (error) {
    consola.error('Error getting packages versions', error)
  }

  const packages: PackageJson.Dependency = {}

  // Create an object with the package names and versions
  Object.entries(lines).forEach(([packageName, packageObj]) => {
    packages[packageName] = packageObj.version
  })

  return packages
}

export const updatePackagesVersions = async (path: string): Promise<void> => {
  consola.start('Updating package.json file in TS Full according to node_modules...')

  const packageObj: PackageJson = fs.readJsonSync(`${path}/package.json`)
  const packageVersions = await getPackagesVersions(path)

  const pkgDeps = packageObj.dependencies

  Object.entries(packageVersions).forEach(([packageName, packageVersion]) => {
    if (pkgDeps?.[packageName]) {
      if (pkgDeps[packageName]?.startsWith('^')) {
        pkgDeps[packageName] = `^${packageVersion}`
      } else if (pkgDeps[packageName]?.startsWith('~')) {
        pkgDeps[packageName] = `~${packageVersion}`
      } else {
        pkgDeps[packageName] = packageVersion
      }
    }
  })

  await fs.writeJson(`${path}/package.json`, packageObj, { spaces: 2 })

  consola.success('Updated package.json file successfully in TS Full according to node_modules!\n')
}
