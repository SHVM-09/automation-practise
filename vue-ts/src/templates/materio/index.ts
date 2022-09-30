import { getCommand } from '@/utils/cli';
import { FillSnippets } from '@templates/base/fillSnippets';
import { GenJS } from '@templates/base/genJS';
import chalk from 'chalk';
import { execSync } from 'child_process';
import parseArgs from 'minimist';
import { config } from './config';
import { Materio } from './template';

const argv = parseArgs(process.argv.slice(2))
const materio = new Materio(config)

const command = getCommand(argv)

// 👉 fillSnippets
if (command === 'fillSnippets') {

  const { tSFull, jSFull } = materio.config.paths

  const snippetFiller = new FillSnippets(tSFull, jSFull)

  snippetFiller.fillSnippet()

  // ℹ️ Run linting after filling all snippets to auto format
  const projectsToLint = [tSFull, jSFull]
  projectsToLint.forEach(p => {
    execSync('yarn lint', { cwd: p })
  })
}


// 👉 gen-js
else if(command === 'gen-js') {
  const jsGenerator = new GenJS(materio.config)
  jsGenerator.genJS()
}

// 👉 Unknown command
else {
  console.log(chalk.yellowBright('Command not found!'));
}
