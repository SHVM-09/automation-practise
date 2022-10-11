import { GenJS } from '@templates/base/genJS'
import { Materio, config } from '@templates/materio'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const materio = new Materio(config)

const jsGenerator = new GenJS(materio.config, !!argv.sk)
jsGenerator.genJS()
