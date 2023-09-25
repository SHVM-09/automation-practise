import { FillSnippets } from '@templates/base/fillSnippets'
import { Materialize, config } from '@templates/materialize'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'fillSnippets.ts',
    description: 'Fill Snippets',
  },
  run() {
    const materialize = new Materialize(config)

    const { tSFull, jSFull } = materialize.config.paths

    new FillSnippets(tSFull, jSFull).fillSnippet()
  },
})

await runMain(main)
