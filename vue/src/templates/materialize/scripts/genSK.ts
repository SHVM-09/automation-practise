import { GenSK } from '@templates/base/genSK'
import { Materialize, config } from '@templates/materialize'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genSK.ts',
    description: 'Generate Starter Kit',
  },
  async run() {
    const materialize = new Materialize(config)
    const sKGenerator = new GenSK(materialize.config)
    await sKGenerator.genSK()
  },
})

await runMain(main)
