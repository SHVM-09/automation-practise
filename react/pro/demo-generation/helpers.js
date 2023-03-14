const pathConfig = require('../../configs/paths.json')

const demoConfigPath = `${pathConfig.demoConfigsPathTSX}/demo-1.ts`
const i18nPath = `${pathConfig.fullVersionTSXPath}/src/configs/i18n.ts`
const nextConfigPath = `${pathConfig.fullVersionTSXPath}/next.config.js`
const themeConfigPath = `${pathConfig.fullVersionTSXPath}/src/configs/themeConfig.ts`
const settingsContextFile = `${pathConfig.fullVersionTSXPath}/src/@core/context/settingsContext.tsx`

const templateName = pathConfig.fullVersionTSXPath
  .split('../')
  .filter(i => i.length)[0]
  .split('/')[0]
  .split('-')[0]

module.exports = {
  i18nPath,
  templateName,
  demoConfigPath,
  nextConfigPath,
  themeConfigPath,
  settingsContextFile
}
