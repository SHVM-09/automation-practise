import { GenSK } from '@templates/base/genSK'
import { Vuexy, config } from '@templates/vuexy'

const vuexy = new Vuexy(config)
const sKGenerator = new GenSK(vuexy.config)
await sKGenerator.genSK()
