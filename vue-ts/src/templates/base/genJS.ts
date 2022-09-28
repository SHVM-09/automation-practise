import { TempLocation } from '@/utils/temp';
import { parse } from 'acorn';
import { namedTypes } from 'ast-types';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { generate } from 'escodegen';
import fs from 'fs-extra';
import path from 'path';
import { TemplateBaseConfig } from './config';

// We need this function for `{ format: { escapeless: true } }` escodegen option to preserve the emojis while generating the code from AST node
const generateFromAST = (ast: unknown) => generate(ast, {
    indent: {
        // indent using two spaces
        style: '  ',
    },
    format: { escapeless: true }
})

// ℹ️ https://github.com/tcr/acorn.ts#note-on-using-with-escodegen
const acornParse = <T>(str: string) => {
  const comments: {type: string, value: string, range: [number, number]}[] = [], tokens: { range: [number, number] }[] = [];

  const ast: T = parse(str, {
    ecmaVersion: 'latest',
    'sourceType': 'module',

    ranges: true,
    // collect comments in Esprima's format
    onComment: function (block, text, start, end) {
      comments.push({
        type: block ? 'Block' : 'Line',
        value: text,
        range: [start, end]
      });
    },
    // collect token ranges
    onToken: function (token) {
      tokens.push({
        range: [token.start, token.end]
      });
    }
  }) as T

  return {
    ast, comments, tokens
  }
}

class ViteConfigHandler {
  private ast: namedTypes.Program | undefined
  
  constructor(private viteConfig: string) {}

  insertPluginProperty(ast: namedTypes.CallExpression, str?: string, astToInsert?: namedTypes.Property) {
    let _astToInsert = astToInsert
    if (str) {
      _astToInsert = (
        (
          (acornParse(`export default {${str}}`).ast as namedTypes.Program).body[0] as namedTypes.ExportDefaultDeclaration
        ).declaration as namedTypes.ObjectExpression
      ).properties[0] as namedTypes.Property
    }
    (ast.arguments as namedTypes.ObjectExpression[])[0].properties.push((_astToInsert as namedTypes.Property))

    return ast
  }

  private getPluginPropertyAST() {
    if (!this.ast)
      throw new Error(chalk.redBright('AST is not created yet!'));

    const exportDefaultDeclaration = this.ast.body.find(declaration => declaration.type === 'ExportDefaultDeclaration') as namedTypes.ExportDefaultDeclaration;
    const viteConfigObjectProperties = (
      (exportDefaultDeclaration.declaration as namedTypes.CallExpression)
        .arguments[0] as namedTypes.ObjectExpression
    ).properties;

    const pluginsProperty = viteConfigObjectProperties.find(property => property.type === 'Property'
      && (property.key as namedTypes.Identifier).name === 'plugins'
    ) as namedTypes.Property;
    return pluginsProperty;
  }

  getPluginIndexInPluginPropertyAST(pluginName: string) {
    const pluginsProperty = this.getPluginPropertyAST()

    return (pluginsProperty.value as namedTypes.ArrayExpression)
      .elements.findIndex(e =>
        (
          (e as namedTypes.CallExpression).callee as namedTypes.Identifier)
          .name === pluginName
      )
  }

  replacePluginAST(pluginName: string, ast: unknown) {
    const pluginIndex = this.getPluginIndexInPluginPropertyAST(pluginName)

    // ❗ WIP
  }

  getPluginAST(name: string) {
    const pluginsProperty = this.getPluginPropertyAST();

    return (pluginsProperty.value as namedTypes.ArrayExpression)
      .elements.find(e =>
        (
          (e as namedTypes.CallExpression).callee as namedTypes.Identifier)
          .name === name
      ) as namedTypes.CallExpression | undefined
  }

  updateExtensionsToJS() {
    this.viteConfig = this.viteConfig.replace('themeConfig.ts', 'themeConfig.js')
  }

  private transformToAST() {
    if (!this.ast) this.ast = acornParse<namedTypes.Program>(this.viteConfig).ast
  }

  addEslintConfigInAutoImportPlugin() {
    this.transformToAST()
    
    const autoImportAST = this.getPluginAST('AutoImport')

    if (!autoImportAST) throw new Error(chalk.redBright("Can't find AutoImport plugin!"))
    
    const eslintConfig = `eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
    }`

    this.updatePluginAST('AutoImport', this.insertPluginProperty(autoImportAST, eslintConfig))
  }

  updatePluginAST(pluginName: string, ast: namedTypes.CallExpression) {
    throw new Error('Method not implemented.');
  }
}

export class GenJS {
  private projectSrcPath: string
  private tempDir: string

  constructor(private templateConfig: TemplateBaseConfig) {
    this.projectSrcPath = path.join(templateConfig.projectPath, 'src')
    this.tempDir = new TempLocation().tempDir
  }

  private genProjectCopyCommand(): string {
    let command = `rsync -av --progress ${this.templateConfig.paths.tSFull}/* ${this.tempDir} `
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

    console.log('viteConfigPath :>> ', viteConfigPath);

    let viteConfig = fs.readFileSync(viteConfigPath, { encoding: 'utf-8' })

    const viteConfigHandler = new ViteConfigHandler(viteConfig)

    viteConfigHandler.updateExtensionsToJS()

    viteConfigHandler.addEslintConfigInAutoImportPlugin()
  }

  genJS() {
    // Copy project to temp dir
    this.copyTSFullToTempDir()

    // Update vite config
    this.updateViteConfig()
  }
}
