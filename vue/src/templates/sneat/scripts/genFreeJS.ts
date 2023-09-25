import { GenJS } from '@templates/base/genJS'
import { Sneat, config } from '@templates/sneat'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genFreeJS.ts',
    description: 'Generate Free Javascript Version',
  },
  async run() {
    const sneat = new Sneat(config)

    const jsGenerator = new GenJS(sneat.config, false, true)
    await jsGenerator.genJS()
  },
})

await runMain(main)
