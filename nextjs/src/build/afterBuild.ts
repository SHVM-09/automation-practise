import fs from 'node:fs/promises';
import { globbySync } from 'globby';

/**
 * Main function to add base path to image references in JS and CSS files.
 */
async function addBasePathToImages(tsFullDir: string, basePath: string): Promise<void> {

  // Check if basePath is available
  if (!basePath) {
    console.log('No basePath found in `process.env.BASEPATH`, skipping...');
    process.exit(0);
  } else {
    console.log(`Adding basePath: ${basePath}`);
  }

  // Get list of JS and CSS files
  const files = globbySync(['.next/**/*.js', '.next/**/*.css', '!.next/server/app/api'], {
    cwd: tsFullDir,
    absolute: true,
    gitignore: false,
    dot: true
  });

  // Process each file
  await Promise.all(
    files.map(async (file: string): Promise<void> => {
      let newContent = await fs.readFile(file, 'utf-8');

      if (file.endsWith('.js')) {
        // Update image references in JavaScript files
        newContent = newContent.replace(/\/images\//g, `${basePath}/images/`);
      } else if (file.endsWith('.css')) {
        // Update image references in CSS files
        newContent = newContent.replace(/\(\/images\//g, `(${basePath}/images/`);
      } else {
        // Throw error for unknown file type
        throw new Error(`Unknown file type: ${file}`);
      }

      // Write updated content back to file
      await fs.writeFile(file, newContent);
    })
  );
}

export default addBasePathToImages;
