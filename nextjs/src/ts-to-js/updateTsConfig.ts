import consola from 'consola'
import fs from 'fs'
import vm from 'vm'

// Interface for the structure of TsConfig
interface TsConfig {
  exclude?: string[]
  [key: string]: any
}

const updateTsConfig = async (projectPath: string) => {
  const tsConfigPath = `${projectPath}/tsconfig.json`

  // Start the process and log it
  consola.start('Updating tsconfig to exclude menu-examples and hook-example folders...')

  try {
    // Read the contents of tsconfig.json
    const tsConfigContent = fs.readFileSync(tsConfigPath, 'utf8')

    // Set up a sandbox environment to safely evaluate the tsconfig content
    const sandbox: { module: { exports: TsConfig } } = { module: { exports: {} } }
    const script = new vm.Script(`module.exports = ${tsConfigContent}`)

    script.runInNewContext(sandbox)

    // Extract the evaluated tsconfig object
    const tsConfig = sandbox.module.exports

    // Update the exclude array in the tsconfig object
    tsConfig.exclude = ['node_modules', 'src/app/menu-examples', 'src/app/hook-examples']

    // Write the modified tsconfig back to the file
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2))

    // Log successful completion
    consola.success('Updated tsconfig to exclude menu-examples and hook-example folders successfully!')
  } catch (error) {
    // Handle and log any errors that occur during the process
    if (error instanceof Error) {
      consola.error(`Error updating tsconfig: ${error.message}`)
    } else {
      consola.error('An unknown error occurred while updating tsconfig')
    }
  }
}

export default updateTsConfig
