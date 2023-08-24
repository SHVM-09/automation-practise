import { Laravel } from '@templates/base/laravel'
import { Sneat, config } from '@templates/sneat'

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
    const sneat = new Sneat(config)
    const laravel = new Laravel(sneat.config)

    laravel.genDemos(args.staging)
  },
})

await runMain(main)

