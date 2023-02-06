import { GenPkg } from '@templates/base/genPkg'
import { Vuexy, config } from '@templates/vuexy'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const vuexy = new Vuexy(config)

await new GenPkg(vuexy.config).genPkg(!argv.n, argv.version)
