import fs from 'fs-extra'
import type { TemplateBaseConfig } from './config'

export class BootstrapFreeVersion {
  constructor(private templateConfig: TemplateBaseConfig) { }

  private copyAssetsFromPro() {
    const { tSFull, freeTS } = this.templateConfig.paths

    const thingsToCopy = [
      'src/@core/scss',
      'src/@iconify',
      'src/@layouts/styles',
      'src/plugins/vuetify',
      'src/plugins/webfontloader.ts',
      'src/styles',
      '.editorconfig',
      '.eslintrc.js',
      'index.html',
      '.gitignore',
      'package.json',
      'tsconfig.json',
    ]

    console.log('tSFull :>> ', tSFull)
    console.log('freeTS :>> ', freeTS)

    // Loop over thingsToCopy and copy them
    thingsToCopy.forEach((thing) => {
      fs.copySync(`${tSFull}/${thing}`, `${freeTS}/${thing}`)
    })
  }

  bootstrap() {
    this.copyAssetsFromPro()
  }
}
