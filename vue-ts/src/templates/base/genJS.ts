import { TempLocation } from '@/utils/temp';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { globby } from 'globby';
import path from 'path';
import { TemplateBaseConfig } from './config';

export class GenJS {
  // private projectSrcPath: string
  private tempDir: string

  constructor(private templateConfig: TemplateBaseConfig) {
    // this.projectSrcPath = path.join(templateConfig.projectPath, 'src')
    this.tempDir = new TempLocation().tempDir
  }

  private genProjectCopyCommand(): string {
    let command = `rsync -av --progress ${this.templateConfig.paths.tSFull}/ ${this.tempDir} `
    this.templateConfig.packageCopyIgnorePatterns.forEach(pattern => {
      
      // We need to escape the * when using rsync
      command += `--exclude ${pattern.replace('*', '\\*')} `
    })

    return command
  }

  private async copyTSFullToTempDir() {
    console.log(`Copying to ${this.tempDir}`);

    const commandToCopyProject = this.genProjectCopyCommand()

    execSync(commandToCopyProject)
  }

  private updateViteConfig() {
    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')

    let viteConfig = fs.readFileSync(viteConfigPath, { encoding: 'utf-8' })

    // Replace themeConfig.ts alias to themeConfig.js
    viteConfig = viteConfig.replace('themeConfig.ts', 'themeConfig.js')

    // enable eslintrc in AutoImport plugin
    const autoImportEslintConfig = `eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
    },`

    viteConfig = viteConfig.replace(/(AutoImport\({\n(\s+))/, `$1${autoImportEslintConfig}\n$2`)
    
    fs.writeFileSync(viteConfigPath, viteConfig, { encoding: 'utf-8' })
  }

  private updateEslintConfig() {
    const eslintConfigPath = path.join(this.tempDir, '.eslintrc.js')
    const viteConfigPath = path.join(this.tempDir, 'vite.config.ts')
    
    // Add import resolver package
    execSync('yarn add eslint-import-resolver-alias', { cwd: this.tempDir })

    // Read eslint config
    let eslintConfig = fs.readFileSync(eslintConfigPath, { encoding: 'utf-8' })

    /*
      Remove all the lines which contains word 'typescript' or 'antfu'
      ℹ️ We will remove line that contains word 'antfu' => We need to remove antfu eslint config as this also add TS rules
    */
    eslintConfig = eslintConfig.split('\n')
      .filter(line => !(line.includes('typescript') || line.includes('antfu')))
      .join('\n')

    // Remove eslint internal rules
    eslintConfig = eslintConfig.replace(/(\s+\/\/ Internal Rules|\s+'valid-appcardcode.*)/g, '')

    /*
      Add auto-import json file in extends array
      Regex: https://regex101.com/r/1RYdYv/2
    */
      eslintConfig = eslintConfig.replace(/(extends: \[\n(\s+))/g, `$1'.eslintrc-auto-import.json',\n$2`)

    // Add vite aliases in eslint import config
    const viteConfig = fs.readFileSync(viteConfigPath, { encoding: 'utf-8' })
    const importAliases = viteConfig.matchAll(/'(?<alias>.*)': fileURLToPath\(new URL\('(?<path>.*)',.*,/g)
    const importAliasesEslintConfig = `alias: {'extensions': ['.ts', '.js', '.tsx', '.jsx', '.mjs'], 'map': ${JSON.stringify([...importAliases].map(m => m.groups && Object.values(m.groups)))}}`

    eslintConfig = eslintConfig.replace(/(module\.exports = {(\n|.)*\s{6}},)((\n|.)*)/g, `$1${importAliasesEslintConfig}$3`)

    fs.writeFileSync(eslintConfigPath, eslintConfig, { encoding: 'utf-8' })
  }

  private updateTSConfig() {
    const tsConfigPath = path.join(this.tempDir, 'tsconfig.json')

    const tsConfig = fs.readJsonSync(tsConfigPath)

    tsConfig.compilerOptions.sourceMap = false

    fs.writeJsonSync(tsConfigPath, tsConfig)
  }

  async genJS() {
    // Copy project to temp dir
    this.copyTSFullToTempDir()

    // Update vite config
    this.updateViteConfig()

    // update eslint
    this.updateEslintConfig()

    /*
      ℹ️ Now we will generate the js & jsx files from ts & tsx files
      But for this we need some changes in our jsconfig file:
        1. Disable source maps
    */
    this.updateTSConfig()

    /*
      Install packages
      ℹ️ We need this to run tsc & generate build
    */
    execSync('yarn', { cwd: this.tempDir })

    // Run `tsc` to compile TypeScript files
    execSync(`yarn tsc`, { cwd: this.tempDir })

    // Remove all TypeScript files
    const tSFiles = await globby(['*.ts', '*.tsx'], { cwd: this.tempDir, absolute: true });
    tSFiles.forEach(f => fs.removeSync(f))
  }
}
