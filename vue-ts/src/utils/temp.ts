import temporaryDirectory from 'temp-dir';

import { fs, path } from 'zx';

export class TempLocation {
  tempDir: string

  constructor() {
    this.tempDir = path.join(temporaryDirectory, Math.random().toString(36).slice(2, 7))
    fs.ensureDir(this.tempDir)
  }
}
