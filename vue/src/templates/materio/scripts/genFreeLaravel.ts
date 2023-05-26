import { Laravel } from '@templates/base/laravel';
import { Materio, config } from '@templates/materio';
import { consola } from 'consola';

import parseArgs from 'minimist';
const argv = parseArgs(process.argv.slice(2))

const materio = new Materio(config)
const laravel = new Laravel(materio.config)

const isFreeJSGenerated = await consola.prompt('Have you generated JS version of Free repo?', {
  type: 'confirm',
})

if (isFreeJSGenerated)
  await laravel.genFreeLaravel()
else
  consola.info('Please generate JS version of Free repo first.')
