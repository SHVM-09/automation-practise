import { Laravel } from '@templates/base/laravel'
import { Materio, config } from '@templates/materio'
import parseArgs from 'minimist'

const materio = new Materio(config)
const laravel = new Laravel(materio.config)

const argv = parseArgs(process.argv.slice(2))

laravel.genDemos(!!argv.staging)
