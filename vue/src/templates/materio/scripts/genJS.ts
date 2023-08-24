import { GenJS } from '@templates/base/genJS'
import { Materio, config } from '@templates/materio'

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
    const materio = new Materio(config)

    const jsGenerator = new GenJS(materio.config, args['starter-kit'])
    await jsGenerator.genJS()
  },
})

await runMain(main)

