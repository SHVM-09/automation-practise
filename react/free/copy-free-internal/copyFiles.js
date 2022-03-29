const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    if (!src.includes('node_modules')) {
      !fs.existsSync(dest)
        ? fs.mkdirSync(dest, { recursive: true, force: true })
        : null
      fs.readdirSync(src).forEach(function (childItemName) {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        )
      })
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}

// ** Copy TS Version
const copyTSVersion = () => {
  return new Promise(resolve => {
    copyRecursiveSync(
      pathConfig.basePathTSX,
      pathConfig.basePathTSX.replace('free-internal', 'free')
    )
    resolve()
  })
}

copyTSVersion()
  .then(() => {
    // ** Copy JS Version if exists
    if (fs.existsSync(pathConfig.basePathJSX)) {
      copyRecursiveSync(
        pathConfig.basePathJSX,
        pathConfig.basePathJSX.replace('free-internal', 'free')
      )
    }
  })
  .then(() => {
    // ** Copy .vscode folder if exists
    if (
      fs.existsSync(
        pathConfig.basePathTSX.replace('/typescript-version', '/.vscode')
      )
    ) {
      copyRecursiveSync(
        pathConfig.basePathTSX.replace('/typescript-version', '/.vscode'),
        pathConfig.basePathTSX
          .replace('free-internal', 'free')
          .replace('/typescript-version', '/.vscode')
      )
    }
  })
  .then(() => {
    // ** Copy Package.json from ts version to root
    if (fs.existsSync(`${pathConfig.basePathTSX}/package.json`)) {
      fs.copyFile(
        `${pathConfig.basePathTSX}/package.json`,
        pathConfig.basePathTSX.replace('/typescript-version'),
        err => {
          if (err) {
            console.log(err)
          }
        }
      )
    }
  })
