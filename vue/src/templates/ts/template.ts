import type { TemplateBaseConfig } from '@templates/base'
import { TemplateBase } from '@templates/base'

export class ThemeSelectionTemplate extends TemplateBase {
  constructor(public override config: TemplateBaseConfig) {
    super(config)
  }

  override async postProcessGeneratedPkg(tempPkgDir: string, isLaravel = false): Promise<void> {
    // ℹ️ We don't want to post process TS package
  }
}

