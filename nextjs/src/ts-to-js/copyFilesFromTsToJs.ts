import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { glob } from 'glob';
import consola from 'consola';

// Convert fs.copyFile and fs.mkdir to their promise-based counterparts
const copyFileAsync = promisify(fs.copyFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Copies a list of files from the source directory to the destination directory.
 * @param files - Array of file paths to copy.
 * @param sourceDir - Source directory path.
 * @param destinationDir - Destination directory path.
 */
async function copyFiles(files: string[], sourceDir: string, destinationDir: string): Promise<void> {
  const copyOperations = files.map(async (file) => {
    // Construct full paths for the source and destination files
    const sourceFile = path.join(sourceDir, file);
    const destinationFile = path.join(destinationDir, file);

    // Ensure the destination directory exists
    const destinationDirPath = path.dirname(destinationFile);
    await mkdirAsync(destinationDirPath, { recursive: true });

    // Copy the file from the source to the destination
    await copyFileAsync(sourceFile, destinationFile);
  });

  // Wait for all file copy operations to complete
  await Promise.all(copyOperations);
}

/**
 * Copies specific files and all CSS module files from a TypeScript project directory to a JavaScript project directory.
 * @param tsDir - The TypeScript project directory.
 * @param jsDir - The JavaScript project directory.
 */
async function copyFilesFromTsToJs(tsDir: string, jsDir: string): Promise<void> {
  // List of specific files to be copied
  const copyFilesArr: string[] = [
    'package.json', 'README.md', '.eslintrc.js', '.gitignore',
    'tsconfig.json', '.prettierrc.json', '.editorconfig', '.npmrc',
    '.stylelintrc.json', '.env', '.env.example',
    'src/app/globals.css', 'src/app/favicon.ico'
  ];

  // Copy specific files
  await copyFiles(copyFilesArr, tsDir, jsDir);
  consola.success('Specific files copied successfully');

  // Find all CSS module files
  const absoluteStylesModuleFiles: string[] = glob.sync(`${tsDir}/src/**/*.module.css`, { nodir: true });
  
  // Convert absolute paths to relative paths
  const stylesModuleFiles = absoluteStylesModuleFiles.map(file => path.relative(tsDir, file));

  // Copy CSS module files
  await copyFiles(stylesModuleFiles, tsDir, jsDir);
  consola.success('Styles module files copied successfully');
}

export default copyFilesFromTsToJs;
