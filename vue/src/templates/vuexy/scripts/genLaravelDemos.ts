import { Laravel } from '@templates/base/laravel'
import { Vuexy, config } from '@templates/vuexy'
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
    const vuexy = new Vuexy(config)
    const laravel = new Laravel(vuexy.config)

    laravel.genDemos(args.staging)
  },
})

await runMain(main)
