import { Master, config } from '@templates/master'
import fs from 'fs-extra'
import path from 'path'

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
