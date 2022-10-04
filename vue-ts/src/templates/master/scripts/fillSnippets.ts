import { FillSnippets } from '@templates/base/fillSnippets'
import { Master, config } from '@templates/master'
import { execCmd } from '@/utils/node'

const master = new Master(config)

const { tSFull, jSFull } = master.config.paths

const snippetFiller = new FillSnippets(tSFull, jSFull)

snippetFiller.fillSnippet()

// ℹ️ Run linting after filling all snippets to auto format
const projectsToLint = [tSFull, jSFull]
projectsToLint.forEach((p) => {
  execCmd('yarn lint', { cwd: p })
})
