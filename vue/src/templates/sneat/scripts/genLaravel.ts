import { Laravel } from '@templates/base/laravel'
import { Sneat, config } from '@templates/sneat'

import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genLaravel.ts',
    description: 'Generate Laravel',
  },
  args: {
    'version': {
      type: 'string',
      description: 'Define package/template version for generated project. This will be used in package.json file.',
      valueHint: '1.0.0',
    },
    'non-interactive': {
      alias: 'n',
      type: 'boolean',
      description: 'Run script in non-interactive mode',
      default: true,
    },
  },
  async run({ args }) {
    const sneat = new Sneat(config)
    const laravel = new Laravel(sneat.config)

    await laravel.genPkg(
      {
        postProcessGeneratedPkg: (...args) => sneat.postProcessGeneratedPkg(...args),
      },
      args['non-interactive'],
      args.version,
    )
  },
})

await runMain(main)
