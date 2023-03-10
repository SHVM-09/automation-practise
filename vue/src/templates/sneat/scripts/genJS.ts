import { GenJS } from '@templates/base/genJS'
import { Sneat, config } from '@templates/sneat'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const sneat = new Sneat(config)

const jsGenerator = new GenJS(sneat.config, !!argv.sk)
jsGenerator.genJS()
