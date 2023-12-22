import consola from "consola";
import fs from "fs/promises";
import path from "path";

/**
 * Recursively removes ESLint comments related to TypeScript from .js and .jsx files.
 * @param dirPath - The directory path to start the recursive removal process.
 */
async function removeEslintTypeComments(dirPath: string): Promise<void> {
  try {
    // Inner function to handle the recursive directory processing
    const processDirectory = async (currentPath: string): Promise<void> => {
      // Read the contents of the current directory
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        // Construct the full path for each entry
        const entryPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // If the entry is a directory, recurse into it
          await processDirectory(entryPath);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          // If the entry is a .js or .jsx file, process it
          // Read the file content
          const fileContent = await fs.readFile(entryPath, 'utf8');
          // Remove specific ESLint comments from the file content
          const updatedFileContent = fileContent.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars/g, '');
          // Write the updated content back to the file
          await fs.writeFile(entryPath, updatedFileContent);
        }
      }
    };

    // Start processing from the provided directory path
    await processDirectory(dirPath);

    // Log a success message after the entire directory tree has been processed
    consola.success("Successfully removed ESLint type comments in javascript-version.");
  } catch (error) {
    // Handle and log any errors that occur during the process
    consola.error(`An error occurred while processing files: ${error instanceof Error ? error.message : error}`);
  }
}

export default removeEslintTypeComments;
