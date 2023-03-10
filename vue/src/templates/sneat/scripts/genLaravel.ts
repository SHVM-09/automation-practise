import { Laravel } from '@templates/base/laravel'
import { Sneat, config } from '@templates/sneat'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const sneat = new Sneat(config)
const laravel = new Laravel(sneat.config)

await laravel.genPkg(!argv.n, argv.version)
