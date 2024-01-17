import { consola } from 'consola';
import { promisify } from 'util';
import { exec as execCallback } from "child_process";
import resetTsConfig from './ts-to-js/resetTsConfig';
import compileTsToJs from './ts-to-js/compileTsToJs';
import updateTsConfig from './ts-to-js/updateTsConfig';
import updatePackageJson from './ts-to-js/updatePackageJson';
import updateEslintRules from './ts-to-js/updateEslintRules';
import copyFilesFromTsToJs from './ts-to-js/copyFilesFromTsToJs';
import copyFoldersFromTsToJs from './ts-to-js/copyFoldersFromTsToJs';
import getTemplateAndVersion from './ts-to-js/getTemplateAndVersion';
import removeTypeFilesFolders from './ts-to-js/removeTypeFilesFolders';
import removeEslintTypeComments from './ts-to-js/removeEslintTypeComments';
import convertTsConfigToJsConfig from './ts-to-js/convertTsConfigToJsConfig';
import { getJsVersionPath, getTsVersionPath } from './utils/templatePathUtils';
import getTemplateName from './utils/getTemplateName';
import getTemplateVersion from './utils/getTemplateVersion';

const exec = promisify(execCallback);


async function main() {
  // const template = await getTemplateAndVersion();

  // const templateName = template?.templateName;
  // const templateVersion = template?.version;
  const templateName = await getTemplateName();
  const templateVersion = await getTemplateVersion(templateName);

  if (!templateName || !templateVersion) {
    consola.error("Template repo or version folder does not exist.");
    return;
  }

  // Vars
  const tsDir = getTsVersionPath(templateName, templateVersion);
  const jsDir = getJsVersionPath(templateName, templateVersion);

  // ────────────── Update tsconfig to exclude folders ──────────────

  // Update tsconfig to exclude menu-examples and hook-example folders
  await updateTsConfig(getTsVersionPath(templateName, templateVersion));

  // ────────────── TypeScript to JavaScript ──────────────

  // Compile Typescript files to JavaScript files in a newly created javascript-version directory
  await compileTsToJs(templateName, templateVersion);

  // ────────────── Reset tsconfig to remove excluded folders ──────────────

  // Reset tsconfig to remove excluded menu-examples and hook-example folders and reset to exclude only node_modules
  await resetTsConfig(tsDir);

  // ────────────── Copy Files ──────────────

  // Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder javascript-version
  await copyFilesFromTsToJs(tsDir, jsDir);
  
  // ────────────── Copy Folders ──────────────
  
  // Copy .vscode & public, styles and prisma directories into javascript-version for assets and .vscode configurations
  await copyFoldersFromTsToJs(tsDir, jsDir);

  // ────────────── Remove Type Files & Folders ──────────────

  // Remove type files and folders from the javascript-version
  await removeTypeFilesFolders(jsDir);

  // ────────────── Update Eslint Rules ──────────────

  // Update eslint rules in javascript-version
  await updateEslintRules(jsDir)
  

  // ────────────── Update Package.json file ──────────────

  // Update package.json in javascript-version
  await updatePackageJson(jsDir)

  // ────────────── Generate JSConfig file ──────────────

  // Generate jsconfig.json in javascript-version
  await convertTsConfigToJsConfig(jsDir)

  // ────────────── Remove eslint type comments ──────────────

  // Remove eslint type comments in javascript-version
  await removeEslintTypeComments(jsDir)

  // ────────────── Install Node Modules ──────────────

  consola.start(`Install node modules in javascript-version's ${templateVersion} folder`);

  // Change to the JavaScript full-version folder
  process.chdir(jsDir);

  // Install node_modules in javascript's full-version folder
  await exec('pnpm install');

  consola.success("Installed node modules successfully!");

  // ────────────── Lint Files ──────────────

  // Run pnpm lint command to fix all the linting error and give space after imports
  consola.start('Run pnpm lint command to fix all the linting error and give space after imports');

  await exec('pnpm run lint:fix');

  consola.success("Linted all the files successfully!");

  // ────────────── Format Files ──────────────

  // Run pnpm format command to format all the files using prettier
  consola.start('Run pnpm format command to format all the files using prettier');

  await exec('pnpm run format');

  consola.success("Formatted all the files successfully!");
}

main().catch((error) => {
    consola.error(`An error occurred: ${error}`);
});
