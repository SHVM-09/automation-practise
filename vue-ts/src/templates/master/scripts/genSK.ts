import { GenSK } from '@templates/base/genSK'
import { Master, config } from '@templates/master'
import parseArgs from 'minimist'

const argv = parseArgs(process.argv.slice(2))

const master = new Master(config)
const sKGenerator = new GenSK(master.config, !!argv.js)
await sKGenerator.genSK()
