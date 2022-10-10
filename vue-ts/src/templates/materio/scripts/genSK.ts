import { GenSK } from '@templates/base/genSK'
import { Materio, config } from '@templates/materio'

const materio = new Materio(config)
const sKGenerator = new GenSK(materio.config)
await sKGenerator.genSK()
