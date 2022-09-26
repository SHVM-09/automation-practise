#!/usr/bin/env zx

import { os, path } from 'zx';

export class TempLocation {
  tempDir: string

  constructor() {
    this.tempDir = path.join(os.tmpdir(), Math.random().toString(36).slice(2, 7))
  }
}
