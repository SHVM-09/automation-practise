import { GenJS } from '@templates/base/genJS'
import { Vuexy, config } from '@templates/vuexy'

import parseArgs from 'minimist'
const argv = parseArgs(process.argv.slice(2))

const vuexy = new Vuexy(config)

const jsGenerator = new GenJS(vuexy.config, !!argv.sk)
jsGenerator.genJS()
