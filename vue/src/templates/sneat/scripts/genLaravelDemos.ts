import { Laravel } from '@templates/base/laravel'
import { Sneat, config } from '@templates/sneat'
import parseArgs from 'minimist'

const sneat = new Sneat(config)
const laravel = new Laravel(sneat.config)

const argv = parseArgs(process.argv.slice(2))

laravel.genDemos(!!argv.staging)
