const fs = require('fs')
const path = require('path')
const shell = require('child_process').execSync
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
  const userLayoutPromise = () => {
    return new Promise(resolve => {
      if (fs.existsSync(userLayoutPath)) {
        fs.readFile(userLayoutPath, 'utf-8', (err, data) => {
          if (err) console.log(err)
          else {
            const result = data
              .replace(
                "import BuyNowButton from './components/BuyNowButton'",
                ''
              )
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
  fs.mkdir(
    `${pathConfig.packagePath}/typescript-version/full-version`,
    { recursive: true },
    err => {
      if (err) {
        console.log(err)

        return
      } else {
        const copyPromise = filesToCopyTSX.map(file => {
          return new Promise(resolve => {
            const dest = file.replace(
              pathConfig.basePathTSX,
              `${pathConfig.packagePath}/typescript-version`
            )
            copyRecursiveSync(file, dest)
            resolve()
          })
        })
        Promise.all(copyPromise)
          .then(() => {
            updateContent(
              userLayoutPathTSX,
              BuyNowComponentPathTSX,
              PackageJSONPathTSX
            )
          })
          .then(() => {
            if (fs.existsSync(pathConfig.starterKitTSXPath)) {
              fs.mkdir(
                `${pathConfig.packagePath}/typescript-version/starter-kit`,
                err => {
                  if (err) {
                    console.log(err)
                  } else {
                    const copyStarterPromise = () =>
                      new Promise(resolve => {
                        copyRecursiveStarterKitSync(
                          pathConfig.starterKitTSXPath,
                          `${pathConfig.packagePath}/typescript-version/starter-kit`
                        )
                        resolve()
                      })

                    copyStarterPromise().then(() => {
                      if (
                        fs.existsSync(
                          `${pathConfig.packagePath}/typescript-version/starter-kit/node_modules`
                        )
                      ) {
                        fs.rmdirSync(
                          `${pathConfig.packagePath}/typescript-version/starter-kit/node_modules`
                        )
                      }
                    }).then(() => {
                      const configsPathStarter = `${pathConfig.packagePath}/typescript-version/starter-kit/src/configs`
                      if(fs.existsSync(`${configsPathStarter}/firebase.ts`)){
                        fs.writeFileSync(`${configsPathStarter}/firebase.ts`, fs.readFileSync('./files/firebase.ts',).toString())
                      }else{
                        console.log(`${pathConfig.packagePath}/typescript-version/starter-kit/src/configs/firebase.ts File Does Not Exist!`)
                      }
                      if(fs.existsSync(`${configsPathStarter}/aws-exports.ts`)){
                        fs.writeFileSync(`${configsPathStarter}/aws-exports.ts`, fs.readFileSync('./files/aws-exports.ts',).toString())
                      }else{
                        console.log(`${pathConfig.packagePath}/typescript-version/starter-kit/src/configs/aws-exports.ts File Does Not Exist!`)
                      }
                    })
                  }
                }
              )
            }
          }).then(() => {
            const configsPathFullVersion = `${pathConfig.packagePath}/typescript-version/full-version/src/configs`
            if(fs.existsSync(`${configsPathFullVersion}/firebase.ts`)){
              fs.writeFileSync(`${configsPathFullVersion}/firebase.ts`, fs.readFileSync('./files/firebase.ts',).toString())
            }else{
              console.log(`${pathConfig.packagePath}/typescript-version/full-version/src/configs/firebase.ts File Does Not Exist!`)
            }
            if(fs.existsSync(`${configsPathFullVersion}/aws-exports.ts`)){
              fs.writeFileSync(`${configsPathFullVersion}/aws-exports.ts`, fs.readFileSync('./files/aws-exports.ts',).toString())
            }else{
              console.log(`${pathConfig.packagePath}/typescript-version/full-version/src/configs/aws-exports.ts File Does Not Exist!`)
            }
          })
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
        const copyPromise = filesToCopyJSX.map(file => {
          return new Promise(resolve => {
            const dest = file.replace(
              pathConfig.basePathJSX,
              `${pathConfig.packagePath}/javascript-version`
            )
            copyRecursiveSync(file, dest)
            resolve()
          })
        })

        Promise.all(copyPromise)
          .then(() => {
            updateContent(
              userLayoutPathJSX,
              BuyNowComponentPathJSX,
              PackageJSONPathJSX
            )
          })
          .then(() => {
            if (fs.existsSync(pathConfig.starterKitJSXPath)) {
              fs.mkdir(
                `${pathConfig.packagePath}/javascript-version/starter-kit`,
                err => {
                  if (err) {
                    console.log(err)
                  } else {
                    const copyStarterPromise = () =>
                      new Promise(resolve => {
                        copyRecursiveStarterKitSync(
                          pathConfig.starterKitJSXPath,
                          `${pathConfig.packagePath}/javascript-version/starter-kit`
                        )
                        resolve()
                      })
                    copyStarterPromise().then(() => {
                      if (
                        fs.existsSync(
                          `${pathConfig.packagePath}/javascript-version/starter-kit/node_modules`
                        )
                      ) {
                        fs.rmdirSync(
                          `${pathConfig.packagePath}/javascript-version/starter-kit/node_modules`
                        )
                      }
                    }).then(() => {

                      const configsPathStarter = `${pathConfig.packagePath}/javascript-version/starter-kit/src/configs`

                      if(fs.existsSync(`${configsPathStarter}/firebase.js`)){
                        fs.writeFileSync(`${configsPathStarter}/firebase.js`, fs.readFileSync('./files/firebase.ts',).toString())
                      }else{
                        console.log(`${pathConfig.packagePath}/javascript-version/starter-kit/src/configs/firebase.ts File Does Not Exist!`)
                      }
                      if(fs.existsSync(`${configsPathStarter}/aws-exports.js`)){
                        fs.writeFileSync(`${configsPathStarter}/aws-exports.js`, fs.readFileSync('./files/aws-exports.ts',).toString())
                      }else{
                        console.log(`${pathConfig.packagePath}/javascript-version/starter-kit/src/configs/aws-exports.ts File Does Not Exist!`)
                      }
                    })
                  }
                }
              )
            }
          }).then(() => {
            const configsPath = `${pathConfig.packagePath}/javascript-version/full-version/src/configs`

            if(fs.existsSync(`${configsPath}/firebase.js`)){
              fs.writeFileSync(`${configsPath}/firebase.js`, fs.readFileSync('./files/firebase.ts',).toString())
            }else{
              console.log(`${pathConfig.packagePath}/javascript-version/full-version/src/configs/firebase.ts File Does Not Exist!`)
            }
            if(fs.existsSync(`${configsPath}/aws-exports.js`)){
              fs.writeFileSync(`${configsPath}/aws-exports.js`, fs.readFileSync('./files/aws-exports.ts',).toString())
            }else{
              console.log(`${pathConfig.packagePath}/javascript-version/full-version/src/configs/aws-exports.ts File Does Not Exist!`)
            }

           
          })
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

// ** If packagePath exists the remove folder generate else create folder & generate
if (!fs.existsSync(pathConfig.packagePath)) {
  fs.mkdir(pathConfig.packagePath, err => {
    if (err) {
      console.log(err)
    } else {
      generate()
      copyRecursiveSync(
        `${pathConfig.packagePath.replace('/package', '')}/.vscode`,
        `${pathConfig.packagePath}/.vscode`
      )
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
          generate()
          copyRecursiveSync(
            `${pathConfig.packagePath.replace('/package', '')}/.vscode`,
            `${pathConfig.packagePath}/.vscode`
          )
        }
      })
    }
  })
}
