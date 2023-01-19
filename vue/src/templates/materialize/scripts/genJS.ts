import { GenJS } from '@templates/base/genJS'
import { Materialize, config } from '@templates/materialize'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const materialize = new Materialize(config)

const jsGenerator = new GenJS(materialize.config, !!argv.sk)
jsGenerator.genJS()
