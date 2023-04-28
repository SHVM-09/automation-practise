import { getDocsConfigPath, injectGTM } from '@templates/base/helper'

// ❗ If you are copying this script, make sure to update this path
import { config } from '@templates/vuexy'

injectGTM(
  getDocsConfigPath(config),
  config.gtm,
)
