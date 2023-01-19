import { Laravel } from '@templates/base/laravel'
import { Materialize, config } from '@templates/materialize'
import parseArgs from 'minimist'

const materialize = new Materialize(config)
const laravel = new Laravel(materialize.config)

const argv = parseArgs(process.argv.slice(2))

await laravel.genPkg(!argv.n, argv.version)
