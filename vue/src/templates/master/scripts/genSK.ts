import { GenSK } from '@templates/base/genSK'
import { Master, config } from '@templates/master'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genSK.ts',
    description: 'Generate Starter Kit',
  },
  async run() {
    const master = new Master(config)
    const sKGenerator = new GenSK(master.config)
    await sKGenerator.genSK()
  },
})

await runMain(main)
