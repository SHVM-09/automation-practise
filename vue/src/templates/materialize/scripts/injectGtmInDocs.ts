import { getDocsConfigPath, injectGTMInVitePress } from '@templates/base/helper'
import { defineCommand, runMain } from 'citty'

// ❗ If you are copying this script, make sure to update this path
import { config } from '@templates/materialize'

const main = defineCommand({
  meta: {
    name: 'injectGtmInDocs.ts',
    description: 'Inject Google Tag Manager in Documentation',
  },
  run() {
    injectGTMInVitePress(
      getDocsConfigPath(config),
      config.gtm,
    )
  },
})

await runMain(main)
