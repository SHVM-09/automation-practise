import { GenDemo } from '@templates/base/genDemo'
import { Materio, config } from '@templates/materio'

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
    const materio = new Materio(config)

    const demoGenerator = new GenDemo(materio.config)
    demoGenerator.generate(args.staging)
  },
})

await runMain(main)

