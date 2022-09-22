const fs = require('fs')
const path = require('path')
const { removeTest } = require('../../remove-test/remove-test')
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
    if (!src.includes('node_modules')) {
      fs.readdirSync(src).forEach(function (childItemName) {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
      })
    }
  } else {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
    }
  }
}

// ** Copy ./vscode
const copyVSCode = () => {
  copyRecursiveSync(`${pathConfig.packagePath.replace('/package', '')}/.vscode`, `${pathConfig.packagePath}/.vscode`)
}

// ** Remove BuyNow & Replace "^" & "~" in package.json file
const updateContent = (userLayoutPath, BuyNowComponentPath, PackageJSONPath) => {
  const userLayoutPromise = () => {
    return new Promise(resolve => {
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

      resolve()
    })
  }
  userLayoutPromise()
    .then(() => {
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
    })
    .then(() => {
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
    })
}

// ** Generates TSX package
const generateTSXPackage = () => {
  fs.mkdir(`${pathConfig.packagePath}/typescript-version/full-version`, { recursive: true }, err => {
    if (err) {
      console.log(err)

      return
    } else {
      const copyPromise = filesToCopyTSX.map(file => {
        return new Promise(resolve => {
          const dest = file.replace(`${pathConfig.basePathTSX}`, `${pathConfig.packagePath}/typescript-version`)
          copyRecursiveSync(file, dest)
          resolve()
        })
      })
      Promise.all(copyPromise)
        .then(() => updateContent(userLayoutPathTSX, BuyNowComponentPathTSX, PackageJSONPathTSX))
        .then(() => {
          if (fs.existsSync(`${pathConfig.starterKitTSXPath}`)) {
            fs.mkdir(`${pathConfig.packagePath}/typescript-version/starter-kit`, err => {
              if (err) {
                console.log(err)
              } else {
                const copyStarterPromise = () =>
                  new Promise(resolve => {
                    copyRecursiveSync(
                      `${pathConfig.starterKitTSXPath}`,
                      `${pathConfig.packagePath}/typescript-version/starter-kit`
                    )
                    resolve()
                  })
                copyStarterPromise()
              }
            })
          }
        })
    }
  })
}

// ** Generates JSX package if javascript-version dir exists
const generateJSXPackage = () => {
  fs.mkdir(`${pathConfig.packagePath}/javascript-version/full-version`, { recursive: true }, err => {
    if (err) {
      console.log(err)

      return
    } else {
      const copyPromise = filesToCopyJSX.map(file => {
        return new Promise(resolve => {
          const dest = file.replace(`${pathConfig.basePathJSX}`, `${pathConfig.packagePath}/javascript-version`)
          copyRecursiveSync(file, dest)
          resolve()
        })
      })
      Promise.all(copyPromise)
        .then(() => updateContent(userLayoutPathJSX, BuyNowComponentPathJSX, PackageJSONPathJSX))
        .then(() => {
          if (fs.existsSync(`${pathConfig.starterKitJSXPath}`)) {
            fs.mkdir(`${pathConfig.packagePath}/javascript-version/starter-kit`, err => {
              if (err) {
                console.log(err)
              } else {
                const copyStarterPromise = () =>
                  new Promise(resolve => {
                    copyRecursiveSync(
                      `${pathConfig.starterKitJSXPath}`,
                      `${pathConfig.packagePath}/javascript-version/starter-kit`
                    )
                    resolve()
                  })
                copyStarterPromise()
              }
            })
          }
        })
    }
  })
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
    const generateTSXPromise = () =>
      new Promise(resolve => {
        generateTSXPackage()
        resolve()
      })
    generateTSXPromise().then(() => {
      generateJSXPackage()
    })
  }
}

if (!fs.existsSync(pathConfig.packagePath)) {
  fs.mkdir(pathConfig.packagePath, err => {
    if (err) {
      console.log(err)
    } else {
      const generatePromise = () =>
        new Promise(resolve => {
          generate()
          copyVSCode()
          resolve()
        })

      generatePromise().then(() => removeTest(pathConfig.packageTSXPath, pathConfig.packageJSXPath))
    }
  })
} else {
  fs.rm(pathConfig.packagePath, { recursive: true, force: true }, err => {
    if (err) {
      console.log(err)
    } else {
      fs.mkdir(pathConfig.packagePath, err => {
        if (err) {
          console.log(err)
        } else {
          const generatePromise = () =>
            new Promise(resolve => {
              generate()
              copyVSCode()
              resolve()
            })

          generatePromise().then(() => removeTest(pathConfig.packageTSXPath, pathConfig.packageJSXPath))
        }
      })
    }
  })
}
