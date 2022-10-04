import { execSync } from 'child_process'
import { FillSnippets } from '@templates/base/fillSnippets'
import { GenDemo } from '@templates/base/genDemo'
import { GenJS } from '@templates/base/genJS'
import chalk from 'chalk'
import parseArgs from 'minimist'
import { config } from './config'
import { Materio } from './template'
import { getCommand } from '@/utils/cli'

const argv = parseArgs(process.argv.slice(2))
const materio = new Materio(config)

console.log('argv :>> ', argv)

const command = getCommand(argv)

// 👉 fillSnippets
if (command === 'fillSnippets') {
  const { tSFull, jSFull } = materio.config.paths

  const snippetFiller = new FillSnippets(tSFull, jSFull)

  snippetFiller.fillSnippet()

  // ℹ️ Run linting after filling all snippets to auto format
  const projectsToLint = [tSFull, jSFull]
  projectsToLint.forEach((p) => {
    execSync('yarn lint', { cwd: p })
  })
}

// 👉 gen-js
else if (command === 'gen-js') {
  const jsGenerator = new GenJS(materio.config)
  jsGenerator.genJS()
}

// 👉 gen-demos
else if (command === 'gen-demos') {
  const demoGenerator = new GenDemo(materio.config)

  // ℹ️ argv.staging can be undefined so we will convert it to boolean
  demoGenerator.generate(!!argv.staging)
}

// 👉 Unknown command
else {
  console.log(chalk.yellowBright('Command not found!'))
}
