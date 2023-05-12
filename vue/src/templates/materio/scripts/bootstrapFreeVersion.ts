import { BootstrapFreeVersion } from '@templates/base/bootstrapFreeVersion'
import { Materio, config } from '@templates/materio'

const materio = new Materio(config)

new BootstrapFreeVersion(materio.config).bootstrap()
