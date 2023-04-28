import { Laravel } from '@templates/base/laravel'
import { Master, config } from '@templates/master'
import parseArgs from 'minimist'

const master = new Master(config)
const laravel = new Laravel(master.config)

const argv = parseArgs(process.argv.slice(2))

await laravel.genPkg(!argv.n, argv.version)
