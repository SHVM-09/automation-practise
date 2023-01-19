import { GenSK } from '@templates/base/genSK'
import { Materialize, config } from '@templates/materialize'

const materialize = new Materialize(config)
const sKGenerator = new GenSK(materialize.config)
await sKGenerator.genSK()
