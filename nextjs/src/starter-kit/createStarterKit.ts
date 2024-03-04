import path from 'path';
import fse from "fs-extra";
import consola from 'consola';
import { copyDirectories, copyFiles } from '@/utils/fsUtils';
import { execCmd } from '@/utils/node';

const createStarterKit = async (tsFullDir: string, tsSkDir: string) => {
  // Create starter-kit directory
  if(!fse.existsSync(tsSkDir)) {
    await fse.mkdir(tsSkDir);
  } else {
    consola.info("Starter-kit directory already exists.");
    consola.start('Removing existing starter-kit directory...');
    await execCmd(`rm -rf ${tsSkDir}`);
    consola.success('Removed existing starter-kit directory successfully!');
  }

  try {
    // Performing the copy directories operation
    await copyDirectories(['.vscode', 'public', 'src'], tsFullDir, tsSkDir);
    // Logging success upon completion
    consola.success("Copied all the necessary folders successfully!");

    // List of specific files to be copied
    const copyFilesArr: string[] = [
      'package.json', 'README.md', '.eslintrc.js', '.gitignore',
      'tsconfig.json', '.prettierrc.json', '.editorconfig', '.npmrc',
      '.stylelintrc.json',
      'next.config.js', 'postcss.config.js', 'tailwind.config.js', 
      'src/app/globals.css', 'src/app/favicon.ico'
    ];

    // Copy specific files
    await copyFiles(copyFilesArr, tsFullDir, tsSkDir);

    // Create .env.example file
    await createEnvExampleFile(tsSkDir);

    consola.success('Specific files copied successfully');
  } catch (error) {
    // Error handling
    if (error instanceof Error) {
      consola.error(`Error while copying folders: ${error.message}`);
    } else {
      consola.error('An unknown error occurred while copying folders');
    }
  }
}

/**
 * Creates a .env.example file in the specified directory with predefined content.
 * @param {string} tsSkDir - The directory where the .env.example file will be created.
 */
async function createEnvExampleFile(tsSkDir: string) {
  try {
    // Construct the file path for .env.example
    const envExampleFilePath = path.join(tsSkDir, '.env.example');

    // Define the content to be written in the .env.example file
    const envExampleFileContent = `# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
BASEPATH=
`;

    // Write the content to the .env.example file
    await fse.writeFile(envExampleFilePath, envExampleFileContent);
  } catch (error) {
    // Log any errors that occur during file creation
    console.error('Error creating .env.example file:', error);
  }
}

export default createStarterKit;
