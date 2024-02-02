import fs from 'fs';
import path from 'path';
import consola from 'consola';
import { deleteFiles, deleteFolders, moveContents } from '@/utils/fsUtils';

const removeUnwantedFoldersFiles = async (tsSkDir: string) => {

  // List of specific folders to be removed
  const unwantedFolders = [
    'src/app/api',
    'src/app/[lang]/hook-examples',
    'src/app/[lang]/menu-examples',
    'src/app/[lang]/(blank-layout-pages)/apps',
    'src/app/[lang]/(blank-layout-pages)/pages',
    'src/app/[lang]/(blank-layout-pages)/forgot-password',
    'src/app/[lang]/(blank-layout-pages)/register',
    'src/components/card-statistics',
    'src/components/charts',
    'src/components/dialogs',
    'src/components/pricing',
    'src/components/buy-now-button',
    'src/components/layout/shared/search',
    'src/contexts',
    'src/data/dictionaries',
    'src/examples',
    'src/libs',
    'src/prisma',
    'src/reducers',
    'src/types/apps',
    'src/types/pages',
    'src/views/apps',
    'src/views/charts',
    'src/views/forms',
    'src/views/icons-test',
    'src/views/pages',
    'src/views/react-table',
    'src/views/dashboards',
    'public/images'
  ];

  // List of specific files to be removed
  const unwantedFiles = [
    'src/utils/get-dictionary.ts',
    'src/utils/i18n.ts',
    'src/components/Form.tsx',
    'src/components/DirectionalIcon.tsx',
    'src/components/Editor.tsx',
    'src/components/layout/shared/LanguageDropdown.tsx',
    'src/components/layout/shared/NotificationsDropdown.tsx',
    'src/components/layout/shared/ShortcutsDropdown.tsx',
    'src/configs/i18n.ts',
    'src/data/searchData.ts',
    'src/views/ForgotPassword.tsx',
    'src/views/NotAuthorized.tsx',
    'src/views/Register.tsx',
    'src/middleware.ts'
  ];

  // Remove unwanted folders
  await deleteFolders(unwantedFolders, tsSkDir);

  // Remove unwanted files
  await deleteFiles(unwantedFiles, tsSkDir);

  // Remove all folders inside (dashboard) folder
  const dashboardDir = path.join(tsSkDir, 'src/app/[lang]/(dashboard)');
  await deleteAllFoldersInDirectory(dashboardDir).catch(err => consola.error(`Error: ${err}`));

  // Move everything from src/app/[lang] to src/app
  await moveContents(`${tsSkDir}/src/app/[lang]`, `${tsSkDir}/src/app`);

  // Remove src/app/[lang] folder
  await deleteFolders(['src/app/[lang]'], tsSkDir);

  // Logging success upon completion
  consola.success("Removed all the unwanted folders and files successfully!");
}

/**
 * Lists all directories within a given directory.
 * @param baseDir - The base directory to list directories from.
 * @returns Array of directory names.
 */
function listDirectories(baseDir: string): string[] {
  if (!fs.existsSync(baseDir)) {
      consola.error(`Directory does not exist: ${baseDir}`);
      return [];
  }

  return fs.readdirSync(baseDir).filter(item => {
      const itemPath = path.join(baseDir, item);
      return fs.lstatSync(itemPath).isDirectory();
  });
}

/**
 * Deletes all directories within a given directory.
 * @param baseDir - The directory from which to delete all subdirectories.
 */
async function deleteAllFoldersInDirectory(baseDir: string): Promise<void> {
  const directories = listDirectories(baseDir);
  if (directories.length > 0) {
      await deleteFolders(directories, baseDir);
      consola.info(`All directories deleted in: ${baseDir}`);
  } else {
      consola.info('No directories to delete.');
  }
}

export default removeUnwantedFoldersFiles;
