import { GenPkg } from '@templates/base/genPkg'
import { Materio, config } from '@templates/materio'

const materio = new Materio(config)

await new GenPkg(materio.config).genPkg()
