import { getDocsSsrHtmlPath, injectGTM } from '@templates/base/helper'

// ❗ If you are copying this script, make sure to update this path
import { config } from '@templates/materialize'

injectGTM(
  getDocsSsrHtmlPath(config),
  config.gtm,
)
