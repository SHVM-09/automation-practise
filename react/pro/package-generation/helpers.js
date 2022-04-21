const pathConfig = require('../../configs/paths.json')

const userLayoutPathTSX = `${pathConfig.packagePath}/typescript-version/full-version/src/layouts/UserLayout.tsx`
const PackageJSONPathTSX = `${pathConfig.packagePath}/typescript-version/full-version/package.json`
const PackageJSONPathJSX = `${pathConfig.packagePath}/javascript-version/full-version/package.json`
const BuyNowComponentPathTSX = `${pathConfig.packagePath}/typescript-version/full-version/src/layouts/components/BuyNowButton.tsx`
const userLayoutPathJSX = `${pathConfig.packagePath}/javascript-version/full-version/src/layouts/UserLayout.js`
const BuyNowComponentPathJSX = `${pathConfig.packagePath}/javascript-version/full-version/src/layouts/components/BuyNowButton.js`

const filesToCopyTSX = [
  `${pathConfig.demoConfigsPathTSX}`,
  `${pathConfig.fullVersionTSXPath}/public`,
  `${pathConfig.fullVersionTSXPath}/src`,
  `${pathConfig.fullVersionTSXPath}/styles`,
  `${pathConfig.fullVersionTSXPath}/.editorconfig`,
  `${pathConfig.fullVersionTSXPath}/.env`,
  `${pathConfig.fullVersionTSXPath}/.eslintrc.json`,
  `${pathConfig.fullVersionTSXPath}/.gitignore`,
  `${pathConfig.fullVersionTSXPath}/.prettierrc.js`,
  `${pathConfig.fullVersionTSXPath}/declaration.d.ts`,
  `${pathConfig.fullVersionTSXPath}/next-env.d.ts`,
  `${pathConfig.fullVersionTSXPath}/next.config.js`,
  `${pathConfig.fullVersionTSXPath}/next.d.ts`,
  `${pathConfig.fullVersionTSXPath}/yarn.lock`,
  `${pathConfig.fullVersionTSXPath}/package.json`,
  `${pathConfig.fullVersionTSXPath}/tsconfig.json`,
  `${pathConfig.fullVersionTSXPath}/package-lock.json`
]

const filesToCopyJSX = [
  `${pathConfig.demoConfigsPathJSX}`,
  `${pathConfig.fullVersionJSXPath}/public`,
  `${pathConfig.fullVersionJSXPath}/src`,
  `${pathConfig.fullVersionJSXPath}/styles`,
  `${pathConfig.fullVersionJSXPath}/.editorconfig`,
  `${pathConfig.fullVersionJSXPath}/.env`,
  `${pathConfig.fullVersionJSXPath}/.eslintrc.js`,
  `${pathConfig.fullVersionJSXPath}/.gitignore`,
  `${pathConfig.fullVersionJSXPath}/.prettierrc.js`,
  `${pathConfig.fullVersionJSXPath}/next.config.js`,
  `${pathConfig.fullVersionJSXPath}/package.json`,
  `${pathConfig.fullVersionJSXPath}/yarn.lock`,
  `${pathConfig.fullVersionJSXPath}/jsconfig.json`,
  `${pathConfig.fullVersionJSXPath}/package-lock.json`
]

module.exports = {
  filesToCopyTSX,
  filesToCopyJSX,
  userLayoutPathJSX,
  userLayoutPathTSX,
  PackageJSONPathTSX,
  PackageJSONPathJSX,
  BuyNowComponentPathTSX,
  BuyNowComponentPathJSX
}
