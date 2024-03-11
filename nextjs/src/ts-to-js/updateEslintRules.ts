import consola from 'consola'
import fs from 'fs/promises'
import vm from 'vm'

// Interface to define the structure of ESLint configuration
interface ESLintConfig {
  extends?: string[]
  rules?: Record<string, any>
  settings?: {
    [key: string]: any
    'import/parsers'?: Record<string, string[]>
    'import/resolver'?: {
      typescript?: { project: string }
    }
  }
  overrides?: Array<{ files: string[]; rules: Record<string, any> }>
  parserOptions?: object
}

// Function to remove TypeScript-specific configurations from an ESLint configuration object
const removeTypescriptConfigs = (config: ESLintConfig): ESLintConfig => {
  // Filter out TypeScript-related extensions
  config.extends = config.extends?.filter(ext => !ext.includes('@typescript-eslint'))

  // Remove TypeScript-related rules
  config.rules = Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(([key]) => !key.startsWith('@typescript-eslint'))
  )

  // Update settings to remove TypeScript parsers and set the project to jsconfig.json
  if (config.settings) {
    if (config.settings['import/parsers']) {
      delete config.settings['import/parsers']['@typescript-eslint/parser']
    }

    if (config.settings['import/resolver']?.typescript) {
      config.settings['import/resolver'].typescript.project = './jsconfig.json'
    }
  }

  // Filter out file overrides specific to TypeScript files
  config.overrides = config.overrides?.filter(
    override => !override.files.some(file => file.endsWith('.ts') || file.endsWith('.tsx'))
  )

  // Remove TypeScript-specific parser options
  delete config.parserOptions

  return config
}

// Function to update ESLint rules in a JavaScript project
const updateEslintRules = async (jsDir: string) => {
  // Path to the ESLint configuration file
  const eslintrcPath = `${jsDir}/.eslintrc.js`

  try {
    // Start updating ESLint rules
    consola.start('Updating eslint rules in javascript-version')

    // Read the ESLint configuration file
    const data = await fs.readFile(eslintrcPath, 'utf8')

    // Evaluate the configuration file in a sandboxed environment
    const sandbox = { module: { exports: {} } }
    const script = new vm.Script(data)

    script.runInNewContext(sandbox)

    // Remove TypeScript configurations from the evaluated ESLint configuration
    const config = sandbox.module.exports as ESLintConfig
    const updatedConfig = removeTypescriptConfigs(config)

    // Write the updated configuration back to the file
    await fs.writeFile(eslintrcPath, `module.exports = ${JSON.stringify(updatedConfig, null, 2)};`)

    // Log successful update
    consola.success('Updated ESLint rules in javascript-version successfully!')
  } catch (error) {
    // Handle and log errors that occur during the update process
    if (error instanceof Error) {
      consola.error(`Error processing the ESLint configuration: ${error.message}`)
    } else {
      consola.error('An unknown error occurred while processing the ESLint configuration')
    }
  }
}

export default updateEslintRules
