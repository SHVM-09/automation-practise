import { BootstrapFreeVersion } from '@templates/base/bootstrapFreeVersion'
import { Materio, config } from '@templates/materio'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'bootstrapFreeVersion.ts',
    description: 'Generate Bootstrap Free Version',
  },
  run() {
    const materio = new Materio(config)

    new BootstrapFreeVersion(materio.config).bootstrap()
  },
})

await runMain(main)
