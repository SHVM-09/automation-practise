import path from 'node:path'
import { Master, config } from '@templates/master'
import { defineCommand, runMain } from 'citty'
import fs from 'fs-extra'

const main = defineCommand({
  meta: {
    name: 'copyFromFreeInternal.ts',
    description: 'Copy from Free Internal repo.',
  },
  run() {
    const master = new Master(config)
    const { freeInternalTs, freeTS } = master.config.paths

    fs.emptyDirSync(freeTS)

    fs.copySync(
      path.join(freeInternalTs, 'full-version'),
      freeTS,
      {
        // Exclude node_modules
        filter: src => !src.includes('node_modules'),
      },
    )
  },
})

await runMain(main)
