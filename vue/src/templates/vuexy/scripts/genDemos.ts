import { GenDemo } from '@templates/base/genDemo'
import { Vuexy, config } from '@templates/vuexy'
import parseArgs from 'minimist'

const vuexy = new Vuexy(config)

const demoGenerator = new GenDemo(vuexy.config)

const argv = parseArgs(process.argv.slice(2))

// ℹ️ argv.staging can be undefined so we will convert it to boolean
demoGenerator.generate(!!argv.staging)
