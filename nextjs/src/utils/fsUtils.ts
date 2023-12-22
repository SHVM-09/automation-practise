import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

// Check if folder exist
export function folderExist(path: string) {
    return fs.existsSync(path)
}

// Check if file exist
/* export function fileExist(path: string) {

} */

// Write file to path
/* export function writeFile(path: string, data: string) {

} */

// Copy files from source to destination
export function copyFiles(filesArr: string[], srcDir: string, destDir: string) {
    filesArr.forEach((file) => {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        
        fs.copyFile(srcFile, destFile, (err) => {
            if (err) throw err;
            console.log(`${file} was copied to ${destDir}`);
        });
    });
}

// Copy directories from source to destination
export function copyDirectories(dirArr: string[], srcDir: string, destDir: string) {
    dirArr.forEach((dir) => {
        const srcDirPath = path.join(srcDir, dir);
        const destDirPath = path.join(destDir, dir);
        
        fse.copy(srcDirPath, destDirPath)
            .then(() => console.log(`${dir} has been copied to ${destDir}`))
            .catch(err => console.error(err));
    });
}

export function removeTypeFilesRecursively(folderPath: string) {
    // Get a list of all files and subdirectories in the current folder
    const items = fs.readdirSync(folderPath);
  
    items.forEach((item) => {
      const itemPath = path.join(folderPath, item);
  
      // Check if the item is a directory
      if (fs.statSync(itemPath).isDirectory()) {
        // Recursively call the function for subdirectories
        removeTypeFilesRecursively(itemPath);
      } else {
        // Check if the file is named "types.js" or "type.js" and remove it
        if (item === 'types.js' || item === 'type.js') {
          fs.unlinkSync(itemPath);
          console.log(`Removed file: ${itemPath}`);
        }
      }
    });
}

export async function deleteFolders(dirArr: string[], sourceDir: string): Promise<void> {
  try {
      const removalPromises = dirArr.map(dir => {
          const dirPath = path.join(sourceDir, dir);
          return fse.remove(dirPath);
      });

      await Promise.all(removalPromises);
      dirArr.forEach(dir => console.log(`${dir} has been removed from ${sourceDir}`));
  } catch (err) {
      console.error(`Error removing directories: ${err}`);
      throw err; // Rethrow to allow handling at a higher level
  }
}
