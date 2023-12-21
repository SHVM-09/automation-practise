import path from "path";
import fs from "fs/promises";
import consola from "consola";
import { deleteFolders } from "@/utils/fsUtils";

/**
 * Recursively removes files named 'types.js' or 'type.js' from a given directory.
 * @param folderPath - The path to the directory to be processed.
 */
async function removeTypeFilesRecursively(folderPath: string): Promise<void> {
  const items = await fs.readdir(folderPath);

  for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
          // Recursively process subdirectories
          await removeTypeFilesRecursively(itemPath);
      } else {
          // Remove specific files named 'types.js' or 'type.js'
          if (item === 'types.js' || item === 'type.js') {
              await fs.unlink(itemPath);
          }
      }
  }
}

/**
 * Removes TypeScript-related files and folders from a JavaScript project directory.
 * @param jsDir - The path to the JavaScript project directory.
 */
async function removeTypeFilesFolders(jsDir: string) {
  try {
    consola.start("Removing type files and folders from the javascript-version");

    // Remove specific TypeScript-related files recursively
    await removeTypeFilesRecursively(jsDir);

    // Delete specific folders related to TypeScript
    await deleteFolders(['src/types'], jsDir);

    // Remove the tsconfig.tsbuildinfo file
    await fs.unlink(`${jsDir}/tsconfig.tsbuildinfo`);

    consola.success("Removed all the type files and folders successfully!");
  } catch (error) {
    // Handle any errors that occur during the process
    consola.error(`An error occurred: ${error instanceof Error ? error.message : error}`);
  }
}

export default removeTypeFilesFolders;
