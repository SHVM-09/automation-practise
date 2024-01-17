import { GenDemo } from '@templates/base/genDemo'
import { Master, config } from '@templates/master'
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
  async run({ args }) {
    const master = new Master(config)

    const demoGenerator = new GenDemo(master.config)

    await demoGenerator.generate(args.staging)
  },
})

await runMain(main)
