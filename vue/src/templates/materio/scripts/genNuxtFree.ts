import { Nuxt } from '@templates/base/nuxt'
import { Materio, config } from '@templates/materio'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genNuxtFree.ts',
    description: 'Generate a Free NuxtJS package',
  },
  args: {
    'version': {
      type: 'string',
      description: 'Define release version for generated package. If not provided, will be asked interactively.',
      valueHint: '1.0.0',
    },
    'non-interactive': {
      alias: 'n',
      type: 'boolean',
      description: 'Run in non-interactive mode',
      default: true,
    },
  },
  async run({ args }) {
    const materio = new Materio(config)
    const nuxt = new Nuxt(materio.config, true)

    await nuxt.genPkg(
      // Hooks
      { postProcessGeneratedPkg: (...args) => materio.postProcessGeneratedPkg(...args) },
      args['non-interactive'],
      args.version,
    )
  },
})

await runMain(main)
