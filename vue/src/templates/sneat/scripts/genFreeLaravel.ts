import { Laravel } from '@templates/base/laravel'
import { Sneat, config } from '@templates/sneat'
import { consola } from 'consola'

const sneat = new Sneat(config)
const laravel = new Laravel(sneat.config)

const isFreeJSGenerated = await consola.prompt('Have you generated JS version of Free repo?', {
  type: 'confirm',
})

if (isFreeJSGenerated)
  await laravel.genFreeLaravel()
else
  consola.info('Please generate JS version of Free repo first.')
