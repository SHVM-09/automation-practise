import { GenJS } from '@templates/base/genJS'
import { Materialize, config } from '@templates/materialize'

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
    const materialize = new Materialize(config)

    const jsGenerator = new GenJS(materialize.config, args['starter-kit'])
    await jsGenerator.genJS()
  },
})

await runMain(main)
