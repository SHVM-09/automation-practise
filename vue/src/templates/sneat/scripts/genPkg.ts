import { GenPkg } from '@templates/base/genPkg'
import { Sneat, config } from '@templates/sneat'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const sneat = new Sneat(config)

await new GenPkg(sneat.config).genPkg(!argv.n, argv.version)
