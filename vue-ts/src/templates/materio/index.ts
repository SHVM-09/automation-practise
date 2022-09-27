import { getCommand } from '@/utils/cli';
import type { OnSnippetUpdateCallback } from '@templates/base/fillSnippets';
import { FillSnippets } from '@templates/base/fillSnippets';
import { GenJS } from '@templates/base/genJS';
import { argv, chalk, fs, path } from 'zx';
import { config } from './config';
import { Materio } from './template';

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

  const snippetFiller = new FillSnippets(js ? jSFullPath : tSFullPath)

  // ℹ️ Update TS snippets as well if both ts & js args are provided
  snippetFiller.fillSnippet(ts && js ? onSnippetUpdateCallback : undefined)
  
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
