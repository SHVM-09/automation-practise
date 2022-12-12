import { GenPkg } from '@templates/base/genPkg'
import { Vuexy, config } from '@templates/vuexy'
import parseArgs from 'minimist'

const vuexy = new Vuexy(config)

const argv = parseArgs(process.argv.slice(2))

await new GenPkg(vuexy.config).genPkg(!argv.n)
