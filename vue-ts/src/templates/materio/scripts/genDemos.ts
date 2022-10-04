import { GenDemo } from '@templates/base/genDemo'
import { Materio, config } from '@templates/materio'
import parseArgs from 'minimist'

const materio = new Materio(config)

const demoGenerator = new GenDemo(materio.config)

const argv = parseArgs(process.argv.slice(2))

// ℹ️ argv.staging can be undefined so we will convert it to boolean
demoGenerator.generate(!!argv.staging)
