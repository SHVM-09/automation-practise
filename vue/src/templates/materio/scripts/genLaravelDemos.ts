import { Laravel } from '@templates/base/laravel'
import { Materio, config } from '@templates/materio'

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
    const materio = new Materio(config)
    const laravel = new Laravel(materio.config)

    laravel.genDemos(args.staging)
  },
})

await runMain(main)

