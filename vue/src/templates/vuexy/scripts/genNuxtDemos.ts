import { GenDemo } from '@templates/base/genNuxtDemos'
import { defineCommand, runMain } from 'citty'

// ❗ If you are copying this script, make sure to update this path
import { Vuexy, config } from '@templates/vuexy'
import consola from 'consola'

const main = defineCommand({
  meta: {
    name: 'genNuxtDemos.ts',
    description: 'Generate nuxt demos',
  },
  async run() {
    consola.info('Generating nuxt demos')
    const vuexy = new Vuexy(config)
    const genDemoIns = new GenDemo(vuexy.config)

    // Prepare for build
    await genDemoIns.prepareForBuild()
    genDemoIns.injectGTMInNuxtConfig()
  },
})

await runMain(main)
