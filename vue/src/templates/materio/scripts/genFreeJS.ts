import { GenJS } from '@templates/base/genJS'
import { Materio, config } from '@templates/materio'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genFreeJS.ts',
    description: 'Generate Free Javascript Version',
  },
  async run() {
    const materio = new Materio(config)

    const jsGenerator = new GenJS(materio.config, false, true)
    await jsGenerator.genJS()
  },
})

await runMain(main)
