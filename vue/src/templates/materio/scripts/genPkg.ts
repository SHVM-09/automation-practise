import { GenPkg } from '@templates/base/genPkg'
import { Materio, config } from '@templates/materio'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const materio = new Materio(config)

await new GenPkg(materio.config).genPkg(!argv.n, argv.version)
