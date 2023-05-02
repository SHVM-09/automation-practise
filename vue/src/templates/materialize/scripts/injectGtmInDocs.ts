import { getDocsConfigPath, injectGTMInVitePress } from '@templates/base/helper'

// ❗ If you are copying this script, make sure to update this path
import { config } from '@templates/materialize'

injectGTMInVitePress(
  getDocsConfigPath(config),
  config.gtm,
)
