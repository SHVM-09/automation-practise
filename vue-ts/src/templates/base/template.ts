#!/usr/bin/env zx

// const { stdout } = await $`pwd`
// console.log(stdout);

import { TempLocation } from '@/utils/temp';
import { TemplateBaseConfig } from './config';

export class TemplateBase {
  tempDir = new TempLocation().tempDir
  
  constructor(public config: TemplateBaseConfig) {
    console.log('config :>> ', this.config);
    console.log('tempDir :>> ', this.tempDir);
  }
}
