import { GenJS } from '@templates/base/genJS'
import { Master, config } from '@templates/master'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const master = new Master(config)

const jsGenerator = new GenJS(master.config, !!argv.sk)
jsGenerator.genJS()
