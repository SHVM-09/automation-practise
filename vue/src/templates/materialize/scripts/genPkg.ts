import { GenPkg } from '@templates/base/genPkg'
import { Materialize, config } from '@templates/materialize'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const materialize = new Materialize(config)

await new GenPkg(materialize.config, {
  postProcessGeneratedPkg: (...args) => materialize.postProcessGeneratedPkg(...args),
}).genPkg(!argv.n, argv.version)
