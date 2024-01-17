import fs from "fs";
import path from "path";
import { glob } from "glob";

const removeUnwantedCodeAndComments = (tsSkDir: string) => {
  const baseDirs = ['src/app','src/components', 'src/layouts', 'src/views'];
  baseDirs.forEach(baseDir => {
    const filePattern = path.join(tsSkDir, baseDir, '**/*.{ts,tsx}');
    const files = glob.sync(filePattern);

    files.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');

        // Remove single-line comments with optional whitespace characters and a blank line after
        content = content.replace(/\/\/.* Imports\n{2,}/g, '');

        fs.writeFileSync(file, content);
      } catch (err) {
        console.error(`Error processing file ${file}: ${err}`);
      }
    });
  });
}

export default removeUnwantedCodeAndComments;
