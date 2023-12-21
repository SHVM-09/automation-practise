import consola from 'consola';
import fs from 'fs';
import vm from 'vm';

// Define an interface for the structure of tsconfig.json
interface TsConfig {
  exclude?: string[];
  [key: string]: any;
}

/**
 * Resets the exclude array in tsconfig.json to default.
 * @param projectPath - The path to the project directory containing tsconfig.json.
 */
const resetTsConfig = async (projectPath: string) => {
  // Define the path to tsconfig.json
  const tsConfigPath = `${projectPath}/tsconfig.json`;

  // Start the update process and log the action
  consola.start("Updating tsconfig to remove excluded folders...");

  try {
    // Read the contents of tsconfig.json
    const tsConfigContent = fs.readFileSync(tsConfigPath, 'utf8');

    // Set up a sandbox environment to safely evaluate the tsconfig content
    const sandbox: { module: { exports: TsConfig } } = { module: { exports: {} } };
    const script = new vm.Script(`module.exports = ${tsConfigContent}`);
    script.runInNewContext(sandbox);

    // Extract the evaluated tsconfig object
    const tsConfig = sandbox.module.exports;

    // Reset the exclude array in the tsconfig object
    tsConfig.exclude = ['node_modules'];

    // Write the modified tsconfig back to the file
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

    // Log successful completion
    consola.success("Updated tsconfig to remove excluded folders successfully!");
  } catch (error) {
    // Handle and log any errors that occur during the process
    consola.error(`Error updating tsconfig: ${error instanceof Error ? error.message : error}`);
  }
};

export default resetTsConfig;
