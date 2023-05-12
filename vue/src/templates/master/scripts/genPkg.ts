import { GenPkg } from '@templates/base/genPkg'
import { Master, config } from '@templates/master'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const master = new Master(config)

await new GenPkg(master.config, {
  postProcessGeneratedPkg: (...args) => master.postProcessGeneratedPkg(...args),
}).genPkg(!argv.n, argv.version)
