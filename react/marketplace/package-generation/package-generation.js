const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const {
  filesToCopyTSX,
  filesToCopyJSX,
  userLayoutPathJSX,
  userLayoutPathTSX,
  PackageJSONPathTSX,
  PackageJSONPathJSX,
  BuyNowComponentPathTSX,
  BuyNowComponentPathJSX
} = require('./helpers')

let arg = null

const passedArgs = process.argv.slice(2)

// ** If any args then update arg var
if (passedArgs[0] !== undefined) {
  arg = passedArgs[0]
} else {
  arg = null
}

// ** Recursively copies files/folders
const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    !fs.existsSync(dest) ? fs.mkdirSync(dest) : null
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      )
    })
  } else {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
    }
  }
}

// ** Recursively copies files/folders
const copyRecursiveStarterKitSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    !fs.existsSync(dest) ? fs.mkdirSync(dest) : null
    if (!src.includes('node_modules')) {
      fs.readdirSync(src).forEach(function (childItemName) {
        copyRecursiveStarterKitSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        )
      })
    }
  } else {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
    }
  }
}

// ** Remove BuyNow & Replace "^" & "~" in package.json file
const updateContent = (
  userLayoutPath,
  BuyNowComponentPath,
  PackageJSONPath
) => {
  if (fs.existsSync(userLayoutPath)) {
    fs.readFile(userLayoutPath, 'utf-8', (err, data) => {
      if (err) console.log(err)
      else {
        const result = data
          .replace("import BuyNowButton from './components/BuyNowButton'", '')
          .replace('<BuyNowButton />', '')
        fs.writeFile(userLayoutPath, result, err => {
          if (err) console.log(err)
        })
      }
    })
  } else {
    console.log('UserLayout File Does Not Exist!')

    return
  }
  if (fs.existsSync(BuyNowComponentPath)) {
    fs.unlink(BuyNowComponentPath, err => {
      if (err) {
        console.log(err)

        return
      }
    })
  } else {
    console.log('BuyNow Component File Does Not Exist!')

    return
  }
  if (fs.existsSync(PackageJSONPath)) {
    fs.readFile(PackageJSONPath, 'utf-8', (err, data) => {
      if (err) console.log(err)
      else {
        const result = data.replace(/\^/g, '').replace('~', '')
        fs.writeFile(PackageJSONPath, result, err => {
          if (err) console.log(err)
        })
      }
    })
  } else {
    console.log('package.json File Does Not Exist!')

    return
  }
}

// ** Generates TSX package
const generateTSXPackage = () => {
  fs.mkdir(
    `${pathConfig.packagePath}/typescript-version/full-version`,
    { recursive: true },
    err => {
      if (err) {
        console.log(err)

        return
      } else {
        filesToCopyTSX.map(file => {
          const dest = file.replace(
            `${pathConfig.basePathTSX}`,
            `${pathConfig.packagePath}/typescript-version`
          )
          copyRecursiveSync(file, dest)
        })
        updateContent(
          userLayoutPathTSX,
          BuyNowComponentPathTSX,
          PackageJSONPathTSX
        )
        if (fs.existsSync(`${pathConfig.starterKitTSXPath}`)) {
          fs.mkdir(
            `${pathConfig.packagePath}/typescript-version/starter-kit`,
            err => {
              if (err) {
                console.log(err)
              } else {
                copyRecursiveStarterKitSync(
                  `${pathConfig.starterKitTSXPath}`,
                  `${pathConfig.packagePath}/typescript-version/starter-kit`
                )
                if (
                  fs.existsSync(
                    `${pathConfig.packagePath}/typescript-version/starter-kit/node_modules`
                  )
                ) {
                  fs.rmdirSync(
                    `${pathConfig.packagePath}/typescript-version/starter-kit/node_modules`
                  )
                }
              }
            }
          )
        }
      }
    }
  )
}

// ** Generates JSX package if javascript-version dir exists
const generateJSXPackage = () => {
  fs.mkdir(
    `${pathConfig.packagePath}/javascript-version/full-version`,
    { recursive: true },
    err => {
      if (err) {
        console.log(err)

        return
      } else {
        filesToCopyJSX.map(file => {
          const dest = file.replace(
            `${pathConfig.basePathJSX}`,
            `${pathConfig.packagePath}/javascript-version`
          )
          copyRecursiveSync(file, dest)
        })
        updateContent(
          userLayoutPathJSX,
          BuyNowComponentPathJSX,
          PackageJSONPathJSX
        )
        if (fs.existsSync(`${pathConfig.starterKitJSXPath}`)) {
          fs.mkdir(
            `${pathConfig.packagePath}/javascript-version/starter-kit`,
            err => {
              if (err) {
                console.log(err)
              } else {
                copyRecursiveStarterKitSync(
                  `${pathConfig.starterKitJSXPath}`,
                  `${pathConfig.packagePath}/javascript-version/starter-kit`
                )
                if (
                  fs.existsSync(
                    `${pathConfig.packagePath}/javascript-version/starter-kit/node_modules`
                  )
                ) {
                  fs.rmdirSync(
                    `${pathConfig.packagePath}/javascript-version/starter-kit/node_modules`
                  )
                }
              }
            }
          )
        }
      }
    }
  )
}

// ** Generates package based on args
const generate = () => {
  if (arg !== null) {
    if (arg === 'tsx') {
      generateTSXPackage()
    } else {
      generateJSXPackage()
    }
  } else {
    generateTSXPackage()
    generateJSXPackage()
  }
}

// ** If packagePath exists the remove folder generate else create folder & generate
if (!fs.existsSync(`${pathConfig.packagePath}`)) {
  fs.mkdir(`${pathConfig.packagePath}`, err => {
    if (err) {
      console.log(err)
    } else {
      generate()
    }
  })
} else {
  fs.rm(`${pathConfig.packagePath}`, { recursive: true, force: true }, err => {
    if (err) {
      console.log(err)
    } else {
      fs.mkdir(`${pathConfig.packagePath}`, err => {
        if (err) {
          console.log(err)
        } else {
          generate()
        }
      })
    }
  })
}
