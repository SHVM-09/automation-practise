import { BootstrapFreeVersion } from '@templates/base/bootstrapFreeVersion'
import { Sneat, config } from '@templates/sneat'
import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'bootstrapFreeVersion.ts',
    description: 'Generate Bootstrap Free Version',
  },
  run() {
    const sneat = new Sneat(config)

    new BootstrapFreeVersion(sneat.config).bootstrap()
  },
})

await runMain(main)
