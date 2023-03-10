import { GenDemo } from '@templates/base/genDemo'
import { Sneat, config } from '@templates/sneat'
import parseArgs from 'minimist'

const sneat = new Sneat(config)

const demoGenerator = new GenDemo(sneat.config)

const argv = parseArgs(process.argv.slice(2))

// ℹ️ argv.staging can be undefined so we will convert it to boolean
demoGenerator.generate(!!argv.staging)
