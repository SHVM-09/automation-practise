import { Laravel } from '@templates/base/laravel'
import { Materio, config } from '@templates/materio'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const materio = new Materio(config)
const laravel = new Laravel(materio.config)

await laravel.genPkg(!argv.n, argv.version)
