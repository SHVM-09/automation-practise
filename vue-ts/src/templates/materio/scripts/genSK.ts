import { GenSK } from '@templates/base/genSK'
import { Materio, config } from '@templates/materio'
import parseArgs from 'minimist'

const argv = parseArgs(process.argv.slice(2))

const materio = new Materio(config)
const sKGenerator = new GenSK(materio.config, !!argv.js)
await sKGenerator.genSK()
