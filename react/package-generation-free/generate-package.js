const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')

const packagePath = pathConfig.basePathTSX.replace(
  'typescript-version',
  'package'
)

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    if (!src.includes('node_modules') && !src.includes('.next')) {
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

const copyToPackage = () => {
  copyRecursiveSync(pathConfig.basePathTSX, `${packagePath}/typescript-version`)
  copyRecursiveSync(pathConfig.basePathJSX, `${packagePath}/javascript-version`)
  copyRecursiveSync(
    pathConfig.basePathTSX.replace('typescript-version', '.vscode'),
    `${packagePath}/.vscode`
  )
}

// ** if package folder exists then delete and create new
if (fs.existsSync(packagePath)) {
  fs.rm(packagePath, { recursive: true, force: true }, err => {
    if (err) {
      console.log(err)
    } else {
      copyToPackage()
    }
  })
} else {
  copyToPackage()
}
