import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { promisify } from 'util';

// Check if folder exist
export function folderExist(path: string) {
  return fs.existsSync(path)
}

// Convert fs.copyFile and fs.mkdir to their promise-based counterparts
const copyFileAsync = promisify(fs.copyFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Copies a list of files from the source directory to the destination directory.
 * @param files - Array of file paths to copy.
 * @param sourceDir - Source directory path.
 * @param destinationDir - Destination directory path.
 */
export async function copyFiles(files: string[], sourceDir: string, destinationDir: string): Promise<void> {
  const copyOperations = files.map(async (file) => {
    try {
      // Construct full paths for the source and destination files
      const sourceFile = path.join(sourceDir, file);
      const destinationFile = path.join(destinationDir, file);

      // Ensure the destination directory exists
      const destinationDirPath = path.dirname(destinationFile);
      await mkdirAsync(destinationDirPath, { recursive: true });

      // Copy the file from the source to the destination
      await copyFileAsync(sourceFile, destinationFile);
    } catch (error) {
      // Handle the error (file not found or other errors)
      console.error(`Error copying file ${file}:`, error);
    }
  });

  // Wait for all file copy operations to complete
  await Promise.all(copyOperations);
}

/**
 * Copies a single directory from the source path to the destination path.
 * @param sourcePath - The source directory path.
 * @param destinationPath - The destination directory path.
 */
export async function copyDirectory(sourcePath: string, destinationPath: string): Promise<void> {
  await fse.copy(sourcePath, destinationPath);
}

/**
* Copies multiple directories from the source directory to the destination directory.
* @param directories - Array of directory names to copy.
* @param sourceDir - The source base directory.
* @param destinationDir - The destination base directory.
*/
export async function copyDirectories(directories: string[], sourceDir: string, destinationDir: string): Promise<void> {
  for (const dir of directories) {
    const sourcePath = path.join(sourceDir, dir);

    try {
      // Check if the source path exists
      await fsp.access(sourcePath, fsp.constants.F_OK);

      const destinationPath = path.join(destinationDir, dir);
      await copyDirectory(sourcePath, destinationPath);
    } catch (error) {
      // If the source path doesn't exist, skip the copy operation
      console.log(`Directory does not exist and will be skipped: ${sourcePath}`);
    }
  }
}

/**
 * Recursively moves files and directories from one directory to another.
 * @param srcDir - The source directory.
 * @param targetDir - The target directory.
 */
export async function moveContents(srcDir: string, targetDir: string): Promise<void> {
  if (fs.existsSync(srcDir)) {
      fs.readdirSync(srcDir).forEach(file => {
        const srcPath = path.join(srcDir, file);
        let targetPath = path.join(targetDir, file);

        if (fs.lstatSync(srcPath).isDirectory()) {
          // Create directory in target if it doesn't exist
          if (!fs.existsSync(targetPath)) {
              fs.mkdirSync(targetPath);
          }
          // Move contents of the directory
          moveContents(srcPath, targetPath);
          // Remove the now-empty source directory
          fs.rmdirSync(srcPath);
        } else {
          // Handle file name conflicts
          if (fs.existsSync(targetPath)) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            let counter = 1;
            do {
              targetPath = path.join(targetDir, `${baseName}_${counter}${ext}`);
              counter++;
            } while (fs.existsSync(targetPath));
          }
          fs.renameSync(srcPath, targetPath);
        }
      });
  }
}

export async function deleteFolders(dirArr: string[], sourceDir: string): Promise<void> {
  try {
    const removalPromises = dirArr.map(dir => {
      const dirPath = path.join(sourceDir, dir);
      return fse.remove(dirPath);
    });

    await Promise.all(removalPromises);
  } catch (err) {
    console.error(`Error removing directories: ${err}`);
    throw err; // Rethrow to allow handling at a higher level
  }
}

export async function deleteFiles(fileArr: string[], sourceDir: string): Promise<void> {
  try {
    const removalPromises = fileArr.map(file => {
      const filePath = path.join(sourceDir, file);
      return fse.remove(filePath);
    });

    await Promise.all(removalPromises);
    fileArr.forEach(file => console.log(`${file} has been removed from ${sourceDir}`));
  } catch (err) {
    console.error(`Error removing files: ${err}`);
    throw err; // Rethrow to allow handling at a higher level
  }
}
