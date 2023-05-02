import type { TemplateBaseConfig } from './config'

export abstract class TemplateBase {
  constructor(public config: TemplateBaseConfig) { }

  abstract postProcessGeneratedPkg(tempPkgDir: string, isLaravel: boolean): Promise<void>
}
