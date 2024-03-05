import consola from 'consola'
import fs from 'fs'
import vm from 'vm'

// Define interfaces for the structure of tsconfig.json and jsconfig.json
interface CompilerOptions {
  allowJs?: boolean
  checkJs?: boolean
  noEmit?: boolean
  declaration?: boolean
  declarationMap?: boolean
  composite?: boolean
  incremental?: boolean
  tsBuildInfoFile?: boolean
  plugins?: any[]
}

interface TsConfig {
  compilerOptions?: CompilerOptions
  include?: string[]
  exclude?: string[]
  [key: string]: any
}

const convertTsConfigToJsConfig = async (jsDir: string): Promise<void> => {
  consola.start('Generating jsconfig.json in javascript-version')

  try {
    // Define the path to tsconfig.json
    const tsConfigPath = `${jsDir}/tsconfig.json`

    // Read tsconfig.json content
    const tsConfigContent = fs.readFileSync(tsConfigPath, 'utf8')

    // Evaluate the tsconfig content in a sandboxed environment
    const sandbox: { module: { exports: TsConfig } } = { module: { exports: {} } }
    const script = new vm.Script(`module.exports = ${tsConfigContent}`)

    script.runInNewContext(sandbox)

    // Extract the tsconfig object
    const tsConfig = sandbox.module.exports

    // Create a jsConfig object by copying tsConfig
    const jsConfig: TsConfig = { ...tsConfig }

    // Modify compilerOptions for JavaScript usage
    if (jsConfig.compilerOptions) {
      jsConfig.compilerOptions.allowJs = true
      jsConfig.compilerOptions.noEmit = true

      // Remove TypeScript-specific compiler options
      delete jsConfig.compilerOptions.declaration
      delete jsConfig.compilerOptions.declarationMap
      delete jsConfig.compilerOptions.composite
      delete jsConfig.compilerOptions.incremental
      delete jsConfig.compilerOptions.tsBuildInfoFile
      delete jsConfig.compilerOptions.plugins
    }

    // Update include paths to target JavaScript files instead of TypeScript files
    if (jsConfig.include) {
      jsConfig.include = jsConfig.include
        .filter(file => !file.endsWith('.d.ts') && !file.includes('.next/types/'))
        .map(file => file.replace(/\.tsx?$/, file.endsWith('.tsx') ? '.jsx' : '.js'))
    }

    // Write the updated configuration to jsconfig.json
    fs.writeFileSync(`${jsDir}/jsconfig.json`, JSON.stringify(jsConfig, null, 2), 'utf8')

    consola.success('Generated jsconfig.json in javascript-version successfully!')
  } catch (error) {
    // Handle and log any errors that occur during the conversion process
    consola.error('Error converting tsconfig to jsconfig:', error)
  }
}

export default convertTsConfigToJsConfig
