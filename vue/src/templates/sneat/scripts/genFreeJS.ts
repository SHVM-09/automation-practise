import { GenJS } from '@templates/base/genJS'
import { Sneat, config } from '@templates/sneat'

const sneat = new Sneat(config)

const jsGenerator = new GenJS(sneat.config, false, true)
await jsGenerator.genJS()
