import { FillSnippets } from '@templates/base/fillSnippets'
import { Vuexy, config } from '@templates/vuexy'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'fillSnippets.ts',
    description: 'Fill Snippets',
  },
  run() {
    const vuexy = new Vuexy(config)

    const { tSFull, jSFull } = vuexy.config.paths

    new FillSnippets(tSFull, jSFull).fillSnippet()
  },
})

await runMain(main)
