import { GenDemo } from '@templates/base/genDemo'
import { defineCommand, runMain } from 'citty'

// ❗ If you are copying this script, make sure to update this path
import { Materio, config } from '@templates/materio'

const main = defineCommand({
  meta: {
    name: 'prepareVueFreeDemo.ts',
    description: 'Prepare vue free demo for build',
  },
  run() {
    const materio = new Materio(config)
    new GenDemo(materio.config).injectGTMInIndexHTML(true)
  },
})

await runMain(main)
