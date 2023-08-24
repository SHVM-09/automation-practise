import { GenPkg } from '@templates/base/genPkg'
import { Sneat, config } from '@templates/sneat'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genPkg.ts',
    description: 'Generate package zip',
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
      default: false,
    },
  },
  async run({ args }) {
    const sneat = new Sneat(config)

    await new GenPkg(
      sneat.config,
      {
        postProcessGeneratedPkg: (...args) => sneat.postProcessGeneratedPkg(...args),
      },
    ).genPkg(args['non-interactive'], args.version)
  },
})

await runMain(main)
