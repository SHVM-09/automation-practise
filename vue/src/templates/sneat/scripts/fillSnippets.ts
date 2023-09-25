import { FillSnippets } from '@templates/base/fillSnippets'
import { Sneat, config } from '@templates/sneat'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'fillSnippets.ts',
    description: 'Fill Snippets',
  },
  run() {
    const sneat = new Sneat(config)

    const { tSFull, jSFull } = sneat.config.paths

    new FillSnippets(tSFull, jSFull).fillSnippet()
  },
})

await runMain(main)
