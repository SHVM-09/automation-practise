import { GenSK } from '@templates/base/genSK'
import { Master, config } from '@templates/master'

const master = new Master(config)
const sKGenerator = new GenSK(master.config)
await sKGenerator.genSK()
