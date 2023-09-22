import { GenPkg } from '@templates/base/genPkg'
import { Materio, config } from '@templates/materio'
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
      default: true,
    },
  },
  async run({ args }) {
    const materio = new Materio(config)

    await new GenPkg(
      materio.config,
      {
        postProcessGeneratedPkg: (...args) => materio.postProcessGeneratedPkg(...args),
      },
    ).genPkg(args['non-interactive'], args.version)
  },
})

await runMain(main)
