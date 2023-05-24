import type { TemplateBaseConfig } from './config'

export abstract class TemplateBase<TemplateConfig extends TemplateBaseConfig> {
  constructor(public config: TemplateConfig) { }

  abstract postProcessGeneratedPkg(tempPkgDir: string, isLaravel: boolean): Promise<void>
}
