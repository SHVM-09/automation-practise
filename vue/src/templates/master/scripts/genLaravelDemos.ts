import { Laravel } from '@templates/base/laravel'
import { Master, config } from '@templates/master'

import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genLaravelDemos.ts',
    description: 'Generate laravel demos',
  },
  args: {
    staging: {
      type: 'boolean',
      description: 'Generate demos for staging environment',
      default: false,
    },
  },
  run({ args }) {
    const master = new Master(config)
    const laravel = new Laravel(master.config)

    laravel.genDemos(args.staging)
  },
})

await runMain(main)
