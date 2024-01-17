import consola from "consola";
import { copyDirectories } from "@/utils/fsUtils";

/**
 * Function to copy specific folders from TypeScript project directory to JavaScript project directory.
 * @param tsDir - The TypeScript project directory.
 * @param jsDir - The JavaScript project directory.
 */
const copyFoldersFromTsToJs = async (tsDir: string, jsDir: string) => {
    // Starting the folder copy process
    consola.start("Copying .vscode & public, styles, and prisma directories into javascript-version");

    // Directories to be copied
    const copyDirectoriesArr = ['.vscode', 'public', 'src/prisma', 'src/assets/iconify-icons/svg'];

    try {
      // Performing the copy operation
      await copyDirectories(copyDirectoriesArr, tsDir, jsDir);
      // Logging success upon completion
      consola.success("Copied all the necessary folders successfully!");
    } catch (error) {
      // Error handling
      if (error instanceof Error) {
          consola.error(`Error while copying folders: ${error.message}`);
      } else {
          consola.error('An unknown error occurred while copying folders');
      }
    }
}

export default copyFoldersFromTsToJs;
