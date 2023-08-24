import { GenJS } from '@templates/base/genJS'
import { Master, config } from '@templates/master'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genJS.ts',
    description: 'Generate Javascript version',
  },
  args: {
    'starter-kit': {
      alias: 'sk',
      type: 'boolean',
      description: 'Generate starter kit variant',
      default: false,
    },
  },
  async run({ args }) {
    const master = new Master(config)

    const jsGenerator = new GenJS(master.config, args['starter-kit'])
    await jsGenerator.genJS()
  },
})

await runMain(main)

