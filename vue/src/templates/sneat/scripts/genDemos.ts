import { GenDemo } from '@templates/base/genDemo'
import { Sneat, config } from '@templates/sneat'

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
    const sneat = new Sneat(config)

    const demoGenerator = new GenDemo(sneat.config)
    demoGenerator.generate(args.staging)
  },
})

await runMain(main)

