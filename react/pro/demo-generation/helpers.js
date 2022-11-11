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

// ** Themeselection GTM Head & Body
const TSGTMHead = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5DDHKGP');`

const TSGTMBody = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5DDHKGP"
height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>`

// ** Pixinvent GTM Head & Body
const PXGTMHead = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5J3LMKC')`

const PXGTMBody = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5J3LMKC"
height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe>`

module.exports = {
  i18nPath,
  TSGTMHead,
  TSGTMBody,
  PXGTMHead,
  PXGTMBody,
  templateName,
  demoConfigPath,
  nextConfigPath,
  themeConfigPath,
  settingsContextFile
}
