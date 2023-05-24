import '@/utils/injectMustReplace'
import { consola } from 'consola'
import fs from 'fs-extra'
import path from 'path'
import type { TemplateBaseConfig } from './config'

export class BootstrapFreeVersion {
  constructor(private templateConfig: TemplateBaseConfig) { }

  private copyStylesFromPro() {
    const { tSFull, freeTS } = this.templateConfig.paths

    const ignoreWordsForCopy = [
      'horizontal',
      'skin',
      'route-transitions',
      'shepherd',
      'calendar',
    ]

    fs.copySync(
      path.join(tSFull, 'src', '@core', 'scss', 'template'),
      path.join(freeTS, 'src', '@core', 'scss', 'template'),
      {
        filter: src => !(
          ignoreWordsForCopy.some(dir => src.includes(dir))
        ),
      },
    )
    consola.warn('Don\'t forget to remove imports of excluded files in index.scss file and other related stuff')
    consola.info(`Ignored:\n${ignoreWordsForCopy.join('\n')}\n`)
  }

  private copyPluginsFromPro() {
    const { tSFull, freeTS } = this.templateConfig.paths
    const pluginsSourceDir = path.join(tSFull, 'src', 'plugins')
    const pluginsDestDir = path.join(freeTS, 'src', 'plugins')

    // Vuetify
    const vuetifyPluginSourceDir = path.join(pluginsSourceDir, 'vuetify')
    const vuetifyPluginDestDir = path.join(pluginsDestDir, 'vuetify')
    
    fs.emptyDirSync(vuetifyPluginDestDir)
    fs.copySync(vuetifyPluginSourceDir, vuetifyPluginDestDir)

    // Webfontloader
    const webfontloaderFileName = 'webfontloader.ts'
    fs.copyFileSync(
      path.join(pluginsSourceDir, webfontloaderFileName),
      path.join(pluginsDestDir, webfontloaderFileName),
    )
  }

  bootstrap() {
    this.copyStylesFromPro()
    this.copyPluginsFromPro()
  }
}
