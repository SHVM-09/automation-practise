import { GenDemo } from '@templates/base/genDemo'
import { Materialize, config } from '@templates/materialize'
import parseArgs from 'minimist'

const materialize = new Materialize(config)

const demoGenerator = new GenDemo(materialize.config)

const argv = parseArgs(process.argv.slice(2))

// ℹ️ argv.staging can be undefined so we will convert it to boolean
demoGenerator.generate(!!argv.staging)
