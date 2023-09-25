import { FillSnippets } from '@templates/base/fillSnippets'
import { Materio, config } from '@templates/materio'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'fillSnippets.ts',
    description: 'Fill Snippets',
  },
  run() {
    const materio = new Materio(config)

    const { tSFull, jSFull } = materio.config.paths

    new FillSnippets(tSFull, jSFull).fillSnippet()
  },
})

await runMain(main)
