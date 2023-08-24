import { GenDemo } from '@templates/base/genDemo'
import { Vuexy, config } from '@templates/vuexy'

import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genDemos.ts',
    description: 'Generate demos',
  },
  args: {
    staging: {
      type: 'boolean',
      description: 'Generate demos for staging environment',
      default: false,
    },
  },
  run({ args }) {
    const vuexy = new Vuexy(config)

    const demoGenerator = new GenDemo(vuexy.config)
    demoGenerator.generate(args.staging)
  },
})

await runMain(main)
