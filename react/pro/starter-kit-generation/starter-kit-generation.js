const fs = require('fs')
const pathConfig = require('../../configs/paths.json')

const {
  filesToCopyTSX,
  filesToCopyJSX,
  foldersToKeepTSX,
  foldersToKeepJSX,
  copyRecursiveSync,
  foldersToRemoveTSX,
  foldersToRemoveJSX
} = require('./helpers')

let arg = null

const passedArgs = process.argv.slice(2)

// ** Updated args var
if (passedArgs[0] !== undefined) {
  arg = passedArgs[0]
} else {
  arg = null
}

// ** Generates second page in src/pages folder
const generateSecondPage = (parentFolder, fileToRead, fileToWrite) => {
  fs.mkdir(`${parentFolder}/src/pages/second-page`, err => {
    if (err) {
      console.log(err)

      return
    } else {
      fs.writeFile(fileToWrite, fs.readFileSync(fileToRead).toString(), err => {
        if (err) {
          console.log(err)

          return
        }
      })
    }
  })
}

// ** Generates second page in src/layouts/components folder
const copyUserDropdown = (parentFolder, version, fileToCopy, fileToUpdate) => {
  fs.copyFile(
    `${fileToCopy}`,
    `${parentFolder}/src/layouts/components/UserDropdown.${version}`,
    err => {
      if (err) {
        console.log(err)

        return
      }
    }
  )
}

// ** Generates TSX StarterKit
const generateTSXStarter = () => {
  const createStarter = () =>
    fs.mkdir(pathConfig.starterKitTSXPath, err => {
      if (err) {
        console.log(err)

        return
      } else {
        const copyPromise = filesToCopyTSX.map(file => {
          return new Promise(resolve => {
            const dest = file.replace('full-version', 'starter-kit')

            copyRecursiveSync(file, dest)
            resolve()
          })
        })

        Promise.all(copyPromise)
          .then(() => {
            foldersToRemoveTSX.map(folder => {
              try {
                fs.rm(folder, { recursive: true, force: true }, err => {
                  err ? console.log(err) : null
                })
              } catch {
                console.log(`Error while deleting ${folder}`)
              }
            })
          })
          .then(() => {
            fs.rm(
              `${pathConfig.starterKitTSXPath}/src/pages`,
              { recursive: true, force: true },
              err => {
                if (err) {
                  console.log(err)

                  return
                } else {
                  fs.mkdir(`${pathConfig.starterKitTSXPath}/src/pages`, err => {
                    if (err) {
                      console.log(err)

                      return
                    } else {
                      const foldersPromise = foldersToKeepTSX.map(file => {
                        return new Promise(resolve => {
                          copyRecursiveSync(
                            `${pathConfig.fullVersionTSXPath}/src/${file}`,
                            `${pathConfig.starterKitTSXPath}/src/${file}`
                          )
                          resolve()
                        })
                      })
                      Promise.all(foldersPromise)
                        .then(() => {
                          generateSecondPage(
                            pathConfig.starterKitTSXPath,
                            './components/tsx/second-page/index.tsx',
                            `${pathConfig.starterKitTSXPath}/src/pages/second-page/index.tsx`
                          )
                        })
                        .then(() => {
                          copyUserDropdown(
                            pathConfig.starterKitTSXPath,
                            'tsx',
                            './components/tsx/UserDropdown.tsx'
                          )
                        })
                    }
                  })
                }
              }
            )
          })
      }
    })

  if (!fs.existsSync(pathConfig.starterKitTSXPath)) {
    createStarter()
  } else {
    fs.rm(
      pathConfig.starterKitTSXPath,
      { recursive: true, force: true },
      err => {
        if (err) {
          console.log(err)
        } else {
          createStarter()
        }
      }
    )
  }
}

// ** Generates JSX StarterKit
const generateJSXStarter = () => {
  if (fs.existsSync(pathConfig.basePathJSX)) {
    const createStarter = () =>
      fs.mkdir(pathConfig.starterKitJSXPath, err => {
        if (err) {
          console.log(err)

          return
        } else {
          const copyPromise = filesToCopyJSX.map(file => {
            return new Promise(resolve => {
              const dest = file.replace('full-version', 'starter-kit')

              copyRecursiveSync(file, dest)
              resolve()
            })
          })

          Promise.all(copyPromise)
            .then(() => {
              foldersToRemoveJSX.map(folder => {
                try {
                  fs.rm(folder, { recursive: true, force: true }, err => {
                    err ? console.log(err) : null
                  })
                } catch {
                  console.log(`Error while deleting ${folder}`)
                }
              })
            })
            .then(() => {
              fs.rm(
                `${pathConfig.starterKitJSXPath}/src/pages`,
                { recursive: true, force: true },
                err => {
                  if (err) {
                    console.log(err)

                    return
                  } else {
                    fs.mkdir(
                      `${pathConfig.starterKitJSXPath}/src/pages`,
                      err => {
                        if (err) {
                          console.log(err)

                          return
                        } else {
                          const folderPromise = foldersToKeepJSX.map(file => {
                            return new Promise(resolve => {
                              copyRecursiveSync(
                                `${pathConfig.fullVersionJSXPath}/src/${file}`,
                                `${pathConfig.starterKitJSXPath}/src/${file}`
                              )
                              resolve()
                            })
                          })

                          Promise.all(folderPromise)
                            .then(() => {
                              generateSecondPage(
                                pathConfig.starterKitJSXPath,
                                './components/jsx/second-page/index.js',
                                `${pathConfig.starterKitJSXPath}/src/pages/second-page/index.js`
                              )
                            })
                            .then(() => {
                              copyUserDropdown(
                                pathConfig.starterKitJSXPath,
                                'js',
                                './components/jsx/UserDropdown.js'
                              )
                            })
                        }
                      }
                    )
                  }
                }
              )
            })
        }
      })

    if (!fs.existsSync(pathConfig.starterKitJSXPath)) {
      createStarter()
    } else {
      fs.rm(
        pathConfig.starterKitJSXPath,
        { recursive: true, force: true },
        err => {
          if (err) {
            console.log(err)
          } else {
            createStarter()
          }
        }
      )
    }
  }
}

// ** Generates StarterKit based on args
const generate = () => {
  if (arg !== null) {
    if (arg === 'tsx') {
      generateTSXStarter()
    } else {
      generateJSXStarter()
    }
  } else {
    const generateTSXPromise = () =>
      new Promise(resolve => {
        generateTSXStarter()
        resolve()
      })
    generateTSXPromise().then(() => {
      generateJSXStarter()
    })
  }
}

generate()
