import { FillSnippets } from '@templates/base/fillSnippets'
import { Master, config } from '@templates/master'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'fillSnippets.ts',
    description: 'Fill Snippets',
  },
  async run() {
    const master = new Master(config)

    const { tSFull, jSFull } = master.config.paths

    await new FillSnippets(tSFull, jSFull).fillSnippet()
  },
})

await runMain(main)
