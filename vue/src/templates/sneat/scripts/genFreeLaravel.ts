import { Laravel } from '@templates/base/laravel'
import { Sneat, config } from '@templates/sneat'
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'

const main = defineCommand({
  meta: {
    name: 'genFreeLaravel.ts',
    description: 'Generate Free Laravel Version',
  },
  async run() {
    const sneat = new Sneat(config)
    const laravel = new Laravel(sneat.config)

    const isFreeJSGenerated = await consola.prompt('Have you generated JS version of Free repo?', {
      type: 'confirm',
    })

    if (isFreeJSGenerated)
      await laravel.genFreeLaravel()
    else
      consola.info('Please generate JS version of Free repo first.')
  },
})

await runMain(main)
