import { getDocsConfigPath, injectGTM } from '@templates/base/helper'

// ❗ If you are copying this script, make sure to update this path
import { config } from '@templates/materialize'

injectGTM(
  getDocsConfigPath(config),
  config.gtm,
)
