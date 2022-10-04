import { FillSnippets } from '@templates/base/fillSnippets'
import { Materio, config } from '@templates/materio'
import { execCmd } from '@/utils/node'

const materio = new Materio(config)

const { tSFull, jSFull } = materio.config.paths

const snippetFiller = new FillSnippets(tSFull, jSFull)

snippetFiller.fillSnippet()

// ℹ️ Run linting after filling all snippets to auto format
const projectsToLint = [tSFull, jSFull]
projectsToLint.forEach((p) => {
  execCmd('yarn lint', { cwd: p })
})
