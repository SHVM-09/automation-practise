import consola from 'consola';
import { promisify } from 'util';
import { exec as execCallback } from "child_process";
import getTemplateName from './utils/getTemplateName';
import { getTsVersionPath } from './utils/templatePathUtils';
import createStarterKit from './starter-kit/createStarterKit';
import { updatePackageJson } from './starter-kit/updatePackageJson';
import removeUnwantedFoldersFiles from './starter-kit/removeUnwantedFoldersFiles';
import removeTranslation from './starter-kit/removeTranslation';
import removeCustomizer from './starter-kit/removeCustomizer';
import updateNavbar from './starter-kit/updateNavbar';
import updateMenu from './starter-kit/updateMenu';
import removeBuyNowButton from './starter-kit/removeBuyNowButton';
import copyRequiredImages from './starter-kit/copyRequiredImages';
import createSkPages from './starter-kit/createSkPages';
import removeAuthentication from './starter-kit/removeAuthentication';
import removeUnwantedCodeAndComments from './starter-kit/removeUnwantedCodeAndComments';

const exec = promisify(execCallback);

async function main() {
  // Vars
  const templateName = await getTemplateName();
  const templateFullVersion = 'full-version';
  const templateSkVersion = 'starter-kit';

  if (!templateName) {
    consola.error("Template repo does not exist.");
    return;
  }

  const tsFullDir = getTsVersionPath(templateName, templateFullVersion);
  const tsSkDir = getTsVersionPath(templateName, templateSkVersion);

  // ────────────── Create Starter Kit ──────────────
  await createStarterKit(tsFullDir, tsSkDir);

  // ────────────── Update Package.json ──────────────
  await updatePackageJson(tsSkDir);

  // ────────────── Remove Unwanted Folders - Files ──────────────
  await removeUnwantedFoldersFiles(tsSkDir);

  // ────────────── Remove Authentication ──────────────
  await removeAuthentication(tsFullDir, tsSkDir);

  // ────────────── Remove Translation ──────────────
  await removeTranslation(tsSkDir);

  // ────────────── Update Menu ──────────────
  await updateMenu(tsSkDir);

  // ────────────── Update Navbar ──────────────
  await updateNavbar(tsSkDir);

  // ────────────── Remove Customizer ──────────────
  await removeCustomizer(tsSkDir);

  // ────────────── Remove Buy-Now button ──────────────
  await removeBuyNowButton(tsSkDir);

  // ────────────── Copy Required Images ──────────────
  await copyRequiredImages(templateName, tsFullDir, tsSkDir); 

  // ────────────── Create Starter-kit Pages ──────────────
  await createSkPages(tsSkDir);

  // ────────────── Remove Unwanted Code and Comments ──────────────
  await removeUnwantedCodeAndComments(tsSkDir);

  // ────────────── Install Node Modules ──────────────

  consola.start("Install node modules in starter-kit folder");

  // Change to the JavaScript full-version folder
  process.chdir(tsSkDir);

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
