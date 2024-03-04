import fs from 'fs'
import path from 'path'
import os from 'os'

export const createTempDir = () => {
  return fs.mkdtempSync(path.join(os.tmpdir(), Math.random().toString(36).slice(2, 7)))
}
