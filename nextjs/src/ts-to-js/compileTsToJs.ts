import { getJsVersionPath, getTsVersionPath } from "@/utils/templatePathUtils";
import { exec } from "child_process";
import consola from "consola";

/**
 * Compiles TypeScript files to JavaScript files using the TypeScript Compiler (tsc).
 * @param projectPath - The path to the TypeScript project directory.
 * @param outDir - The output directory for the compiled JavaScript files.
 */
async function compileTypeScriptToJavaScript(projectPath: string, outDir: string): Promise<void> {
  return new Promise((resolve) => {
    // Execute the TypeScript Compiler with specified project settings
    exec(`tsc --project ${projectPath}/tsconfig.json --outDir ${outDir} --noEmit false`, (error, stdout, stderr) => {
      // Handle errors and output from the compilation process
      if (error || stderr) {
        consola.error(`Compilation failed: ${error ? error.message : stderr}`);
      } else {
        consola.success("Compilation successful!");
      }
      // Resolve the promise once the process is complete
      resolve();
    });
  });
}

/**
 * Compiles TypeScript files to JavaScript files for a given template and version.
 * @param templateName - The name of the template.
 * @param templateVersion - The version of the template (e.g., 'full-version', 'starter-kit').
 */
const compileTsToJs = async (templateName: string, templateVersion: string) => {
  consola.start("Compiling Typescript files to React JS files...");

  // Determine the paths for the TypeScript and JavaScript versions
  const tsDir = getTsVersionPath(templateName, templateVersion);
  const jsDir = getJsVersionPath(templateName, templateVersion);

  if (templateVersion === 'both') {
    // If 'both' versions are selected, compile both the full version and the starter kit
    const fullVersionTSDir = getTsVersionPath(templateName, 'full-version');
    const fullVersionJSDir = getJsVersionPath(templateName, 'full-version');
    const starterKitTSDir = getTsVersionPath(templateName, 'starter-kit');
    const starterKitJSDir = getJsVersionPath(templateName, 'starter-kit');

    await compileTypeScriptToJavaScript(fullVersionTSDir, fullVersionJSDir);
    await compileTypeScriptToJavaScript(starterKitTSDir, starterKitJSDir);
  } else {
    // Compile TypeScript to JavaScript for the selected version (full-version or starter-kit)
    await compileTypeScriptToJavaScript(tsDir, jsDir);
  }
}

export default compileTsToJs;
