import { Nuxt } from '@templates/base/nuxt'
import { Vuexy, config } from '@templates/vuexy'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'genNuxt.ts',
    description: 'Generate a NuxtJS package',
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
    const vuexy = new Vuexy(config)
    const nuxt = new Nuxt(vuexy.config)

    await nuxt.genPkg(
      // Hooks
      { postProcessGeneratedPkg: (...args) => vuexy.postProcessGeneratedPkg(...args) },
      args['non-interactive'],
      args.version,
    )
  },
})

await runMain(main)
