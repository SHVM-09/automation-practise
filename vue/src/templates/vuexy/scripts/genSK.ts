import { GenSK } from '@templates/base/genSK'
import { Vuexy, config } from '@templates/vuexy'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genSK.ts',
    description: 'Generate Starter Kit',
  },
  async run() {
    const vuexy = new Vuexy(config)
    const sKGenerator = new GenSK(vuexy.config)
    await sKGenerator.genSK()
  },
})

await runMain(main)
