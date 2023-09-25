import { Laravel } from '@templates/base/laravel'
import { Materio, config } from '@templates/materio'
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'

const main = defineCommand({
  meta: {
    name: 'genFreeLaravel.ts',
    description: 'Generate Free Laravel Version',
  },
  async run() {
    const materio = new Materio(config)
    const laravel = new Laravel(materio.config)

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
