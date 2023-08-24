import { GenJS } from '@templates/base/genJS'
import { Sneat, config } from '@templates/sneat'

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
    const sneat = new Sneat(config)

    const jsGenerator = new GenJS(sneat.config, args['starter-kit'])
    await jsGenerator.genJS()
  },
})

await runMain(main)

