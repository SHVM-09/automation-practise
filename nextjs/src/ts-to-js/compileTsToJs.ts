import consola from 'consola'
import { getJsVersionPath, getTsVersionPath } from '../utils/templatePathUtils'
import { execCmd } from '../utils/node'

/**
 * Compiles TypeScript files to JavaScript files using the TypeScript Compiler (tsc).
 * @param projectPath - The path to the TypeScript project directory.
 * @param outDir - The output directory for the compiled JavaScript files.
 */
async function compileTypeScriptToJavaScript(projectPath: string, outDir: string): Promise<void> {
  try {
    // Construct the TypeScript compiler command
    const command = `npx tsc --project ${projectPath}/tsconfig.json --outDir ${outDir} --noEmit false`

    // Increase the maxBuffer size to accommodate large outputs.
    // The maxBuffer specifies the largest amount of data allowed on stdout or stderr.
    // If this value is exceeded, the child process is terminated.
    const maxBuffer = 1024 * 1024 // 1 megabyte

    // Execute the TypeScript Compiler command and wait for its completion
    const { stderr } = await execCmd(command, { maxBuffer })

    // Check for errors in stderr
    if (stderr) {
      consola.error(`Compilation failed: ${stderr}`)
    } else {
      consola.success('Compilation successful!')
    }
  } catch (error) {
    // Error handling for exec function
    if (error instanceof Error) {
      // Properly handle Error instance, accessing message property
      consola.error(`Compilation failed: ${error.message}`)
    } else {
      // Handle non-Error instances
      consola.error('An unknown error occurred during compilation.')
    }
  }
}

/**
 * Compiles TypeScript files to JavaScript files for a given template and version.
 * @param templateName - The name of the template.
 * @param templateVersion - The version of the template (e.g., 'full-version', 'starter-kit').
 */
const compileTsToJs = async (templateName: string, templateVersion: string) => {
  consola.start('Compiling Typescript files to React JS files...')

  // Determine the paths for the TypeScript and JavaScript versions
  const tsDir = getTsVersionPath(templateName, templateVersion)
  const jsDir = getJsVersionPath(templateName, templateVersion)

  // Compile TypeScript to JavaScript for the selected version (full-version or starter-kit)
  await compileTypeScriptToJavaScript(tsDir, jsDir)
}

export default compileTsToJs
