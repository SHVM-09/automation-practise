import consola from "consola";
import fse from "fs-extra";
import path from "path";

/**
 * Copies a single directory from the source path to the destination path.
 * @param sourcePath - The source directory path.
 * @param destinationPath - The destination directory path.
 */
async function copyDirectory(sourcePath: string, destinationPath: string): Promise<void> {
    await fse.copy(sourcePath, destinationPath);
}

/**
 * Copies multiple directories from the source directory to the destination directory.
 * @param directories - Array of directory names to copy.
 * @param sourceDir - The source base directory.
 * @param destinationDir - The destination base directory.
 */
async function copyDirectories(directories: string[], sourceDir: string, destinationDir: string): Promise<void> {
    for (const dir of directories) {
        const sourcePath = path.join(sourceDir, dir);
        const destinationPath = path.join(destinationDir, dir);
        await copyDirectory(sourcePath, destinationPath);
    }
}

/**
 * Function to copy specific folders from TypeScript project directory to JavaScript project directory.
 * @param tsDir - The TypeScript project directory.
 * @param jsDir - The JavaScript project directory.
 */
const copyFoldersFromTsToJs = async (tsDir: string, jsDir: string) => {
    // Starting the folder copy process
    consola.start("Copying .vscode & public, styles, and prisma directories into javascript-version");

    // Directories to be copied
    const copyDirectoriesArr = ['.vscode', 'public', 'src/styles', 'src/prisma', 'src/assets/iconify-icons/svg'];

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
