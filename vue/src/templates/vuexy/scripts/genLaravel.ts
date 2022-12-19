import { Laravel } from '@templates/base/laravel'
import { Vuexy, config } from '@templates/vuexy'
import parseArgs from 'minimist'

const vuexy = new Vuexy(config)
const laravel = new Laravel(vuexy.config)

const argv = parseArgs(process.argv.slice(2))

await laravel.genPkg(!argv.n)
