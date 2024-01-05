import { Laravel } from '@templates/base/laravel'
import { Materialize, config } from '@templates/materialize'
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
    isFree: {
      type: 'boolean',
      description: 'Generate demos for free environment',
      default: false,
    },
  },
  run({ args }) {
    const materialize = new Materialize(config)
    const laravel = new Laravel(materialize.config)

    laravel.genDemos(args.staging, args.isFree)
  },
})

await runMain(main)
