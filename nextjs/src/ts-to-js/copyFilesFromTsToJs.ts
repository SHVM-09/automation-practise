import path from 'path'
import { globbySync } from 'globby'
import consola from 'consola'
import { copyFiles } from '@/utils/fsUtils'

/**
 * Copies specific files and all CSS module files from a TypeScript project directory to a JavaScript project directory.
 * @param tsDir - The TypeScript project directory.
 * @param jsDir - The JavaScript project directory.
 */
async function copyFilesFromTsToJs(tsDir: string, jsDir: string): Promise<void> {
  // List of specific files to be copied
  const copyFilesArr: string[] = [
    'package.json',
    'README.md',
    '.eslintrc.js',
    '.gitignore',
    'tsconfig.json',
    '.prettierrc.json',
    '.editorconfig',
    '.npmrc',
    '.stylelintrc.json',
    '.env',
    '.env.example',
    'src/app/globals.css',
    'src/app/favicon.ico'
  ]

  // Copy specific files
  await copyFiles(copyFilesArr, tsDir, jsDir)
  consola.success('Specific files copied successfully')

  // Find all CSS module files
  const absoluteStylesModuleFiles: string[] = globbySync(`${tsDir}/src/**/*.module.css`, { onlyFiles: true })

  // Convert absolute paths to relative paths
  const stylesModuleFiles = absoluteStylesModuleFiles.map(file => path.relative(tsDir, file))

  // Copy CSS module files
  await copyFiles(stylesModuleFiles, tsDir, jsDir)
  consola.success('Styles module files copied successfully')
}

export default copyFilesFromTsToJs
