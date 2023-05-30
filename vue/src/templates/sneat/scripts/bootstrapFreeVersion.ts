import { BootstrapFreeVersion } from '@templates/base/bootstrapFreeVersion'
import { Sneat, config } from '@templates/sneat'

const sneat = new Sneat(config)

new BootstrapFreeVersion(sneat.config).bootstrap()
