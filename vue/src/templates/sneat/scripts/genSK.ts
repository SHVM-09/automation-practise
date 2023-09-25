import { GenSK } from '@templates/base/genSK'
import { Sneat, config } from '@templates/sneat'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genSK.ts',
    description: 'Generate Starter Kit',
  },
  async run() {
    const sneat = new Sneat(config)
    const sKGenerator = new GenSK(sneat.config)
    await sKGenerator.genSK()
  },
})

await runMain(main)
