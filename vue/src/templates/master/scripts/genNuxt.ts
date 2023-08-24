import { Nuxt } from '@templates/base/nuxt'
import { Master, config } from '@templates/master'
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
      default: false,
    },
  },
  async run({ args }) {
    const master = new Master(config)
    const nuxt = new Nuxt(master.config)

    await nuxt.genPkg(
      // Hooks
      { postProcessGeneratedPkg: (...args) => master.postProcessGeneratedPkg(...args) },
      !args.n,
      args.version,
    )
  },
})

await runMain(main)
