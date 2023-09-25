import { GenSK } from '@templates/base/genSK'
import { Materio, config } from '@templates/materio'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genSK.ts',
    description: 'Generate Starter Kit',
  },
  async run() {
    const materio = new Materio(config)
    const sKGenerator = new GenSK(materio.config)
    await sKGenerator.genSK()
  },
})

await runMain(main)
