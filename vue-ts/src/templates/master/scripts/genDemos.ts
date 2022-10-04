import { GenDemo } from '@templates/base/genDemo'
import { Master, config } from '@templates/master'
import parseArgs from 'minimist'

const master = new Master(config)

const demoGenerator = new GenDemo(master.config)

const argv = parseArgs(process.argv.slice(2))

// ℹ️ argv.staging can be undefined so we will convert it to boolean
demoGenerator.generate(!!argv.staging)
