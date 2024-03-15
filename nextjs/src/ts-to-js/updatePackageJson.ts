import consola from 'consola'
import fs from 'fs'
import { promisify } from 'util'

// Promisify readFile and writeFile for asynchronous operations
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

// Interface for the structure of package.json
interface PackageJson {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  scripts: Record<string, string>
  [key: string]: any
}

// Function to check if a package name is TypeScript-related
const isTypescriptRelated = (packageName: string): boolean => {
  return packageName.startsWith('@types/') || packageName.includes('typescript') || packageName === '@iconify/types'
}

// Function to update the build:icons script in package.json
const updateBuildIconsScript = (scripts: Record<string, string>): void => {
  if (scripts['build:icons']) {
    scripts['build:icons'] = scripts['build:icons'].replace(/\.ts$/, '.js')
  }
}

// Main function to update package.json
const updatePackageJson = async (jsDir: string) => {
  consola.start('Updating package.json in javascript-version')

  try {
    const packageJsonPath = `${jsDir}/package.json`
    const packageJsonContent = await readFileAsync(packageJsonPath, 'utf8')
    const packageJson: PackageJson = JSON.parse(packageJsonContent)

    // Filter out TypeScript-related dependencies
    packageJson.dependencies = Object.fromEntries(
      Object.entries(packageJson.dependencies).filter(([packageName]) => !isTypescriptRelated(packageName))
    )
    packageJson.devDependencies = Object.fromEntries(
      Object.entries(packageJson.devDependencies).filter(([packageName]) => !isTypescriptRelated(packageName))
    )

    // Update build:icons script if it exists
    updateBuildIconsScript(packageJson.scripts)

    // Write the updated package.json back to the file
    await writeFileAsync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
    consola.success('Updated package.json in javascript-version successfully!')
  } catch (error) {
    // Handle and log any errors during the update process
    if (error instanceof Error) {
      consola.error(`Error updating package.json: ${error.message}`)
    } else {
      consola.error('An unknown error occurred while updating package.json')
    }
  }
}

export default updatePackageJson
