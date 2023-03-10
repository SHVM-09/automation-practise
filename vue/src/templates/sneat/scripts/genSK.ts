import { GenSK } from '@templates/base/genSK'
import { Sneat, config } from '@templates/sneat'

const sneat = new Sneat(config)
const sKGenerator = new GenSK(sneat.config)
await sKGenerator.genSK()
