import { GenDemo } from '@templates/base/genDemo'
import { Materialize, config } from '@templates/materialize'
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
    const materialize = new Materialize(config)

    const demoGenerator = new GenDemo(materialize.config)
    demoGenerator.generate(args.staging)
  },
})

await runMain(main)
