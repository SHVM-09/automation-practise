// const { stdout } = await $`pwd`
// console.log(stdout);

import { TemplateBaseConfig } from './config';

export class TemplateBase {
  
  constructor(public config: TemplateBaseConfig) {}
}
