import { getCommand } from '@/utils/cli';
import type { OnSnippetUpdateCallback } from '@templates/base/fillSnippets';
import { FillSnippets } from '@templates/base/fillSnippets';
import { GenJS } from '@templates/base/genJS';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import parseArgs from 'minimist';
import path from 'path';
import { config } from './config';
import { Materio } from './template';

const argv = parseArgs(process.argv.slice(2))
const materio = new Materio(config)

const materioVersionsPaths = {
  tSFull: path.join(materio.config.projectPath, 'typescript-version', 'full-version'),
  tSStarter: path.join(materio.config.projectPath, 'typescript-version', 'starter-kit'),
  jSFull: path.join(materio.config.projectPath, 'javascript-version', 'full-version'),
  jSStarter: path.join(materio.config.projectPath, 'javascript-version', 'starter-kit'),
}
const materioSrcPaths: typeof materioVersionsPaths = Object.fromEntries(
  Object.entries(materioVersionsPaths)
    .map(
      ([v, _path]) => ([ [v], path.join(_path, 'src') ])
    )
)

console.log('argv :>> ', argv);


const command = getCommand(argv)

// SECTION fillSnippets
const onSnippetUpdateCallback: OnSnippetUpdateCallback = (updatedSnippet, snippetFilePath) => {
  const tsSnippetFilePath = snippetFilePath
    .replace('javascript-version', 'typescript-version')
    .replace('.js', '.ts')
  
  // Update TS snippet
  fs.writeFileSync(tsSnippetFilePath, updatedSnippet, { encoding: 'utf-8' })
}

if (command === 'fillSnippets') {
  const { ts, js } = argv
  const { tSFull: tSFullPath, jSFull: jSFullPath } = materioVersionsPaths

  const projectPathForFillingSnippets = js ? jSFullPath : tSFullPath

  const snippetFiller = new FillSnippets(projectPathForFillingSnippets)

  snippetFiller.fillSnippet()

  // ℹ️ Run linting after filling all snippets to auto format
  execSync('yarn lint', { cwd: projectPathForFillingSnippets })

  // If ts & js both args are provided also lint ts project
  if(ts && js) execSync('yarn lint', { cwd: tSFullPath })
}
// !SECTION

// SECTION gen-js
else if(command === 'gen-js') {
  const jsGenerator = new GenJS(materio.config)
  jsGenerator.genJS()
}
// !SECTION
else {
  console.log(chalk.yellowBright('Command not found!'));
}
