import { GenJS } from '@templates/base/genJS'
import { Vuexy, config } from '@templates/vuexy'

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
    const vuexy = new Vuexy(config)

    const jsGenerator = new GenJS(vuexy.config, args['starter-kit'])
    await jsGenerator.genJS()
  },
})

await runMain(main)
