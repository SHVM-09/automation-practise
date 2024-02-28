import { GenDemo } from '@templates/base/genNuxtDemos'
import { defineCommand, runMain } from 'citty'

// ❗ If you are copying this script, make sure to update this path
import { Materio, config } from '@templates/materio'

const main = defineCommand({
  meta: {
    name: 'prepareNuxtFreeDemo.ts',
    description: 'Prepare nuxt free demo for build',
  },
  run() {
    const materio = new Materio(config)
    new GenDemo(materio.config).injectGTMInNuxtConfig(true)
  },
})

await runMain(main)
