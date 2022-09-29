const fs = require('fs')
const pathConfig = require('../../configs/paths.json')

const {
  filesToCopyTSX,
  filesToCopyJSX,
  foldersToKeepTSX,
  foldersToKeepJSX,
  copyRecursiveSync,
  foldersToRemoveTSX,
  foldersToRemoveJSX,
  homeAndSecondPagePaths
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
const copyHomeAndSecondPage = () => {
  homeAndSecondPagePaths.map(folder => {
    if (fs.existsSync(folder.from)) {
      copyRecursiveSync(folder.from, folder.to)
    }
  })
}

// ** copy updated userDropdown in src/layouts/components folder
const copyUserDropdown = (parentFolder, version, versionFolder) => {
  const staticPath = 'src/@core/layouts/components/shared-components'
  fs.copyFile(
    `${versionFolder}/${staticPath}/UserDropdown.${version}`,
    `${parentFolder}/${staticPath}/UserDropdown.${version}`,
    err => {
      if (err) {
        console.log(err)

        return
      }
    }
  )
}

const generateFakeDB = (parentFolder, fakeDBPath, version) => {
  fs.mkdir(`${parentFolder}/src/@fake-db`, err => {
    if (err) {
      console.log(err)

      return
    } else {
      if(fs.existsSync( `${fakeDBPath}/auth`)){
        copyRecursiveSync(
        `${fakeDBPath}/auth`,
        `${parentFolder}/src/@fake-db/auth`
      )
      }
      if(fs.existsSync( `${fakeDBPath}/mock.${version}`)){
        copyRecursiveSync(
        `${fakeDBPath}/mock.${version}`,
        `${parentFolder}/src/@fake-db/mock.${version}`
      )
      }

      fs.writeFile(
        `${parentFolder}/src/@fake-db/index.${version}`,
        `import mock from './mock' \n\n import './auth/jwt' \n\n mock.onAny().passThrough()`,
        err => {
          if (err) {
            console.log(err)

            return
          }
        }
      )
    }
  })
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
                          if(fs.existsSync(`${pathConfig.fullVersionTSXPath}/src/${file}`)){
                            copyRecursiveSync(
                              `${pathConfig.fullVersionTSXPath}/src/${file}`,
                              `${pathConfig.starterKitTSXPath}/src/${file}`
                            )
                          }
                          resolve()
                        })
                      })
                      Promise.all(foldersPromise)
                        .then(() => {
                          copyHomeAndSecondPage()
                        })
                        .then(() => {
                          
                          generateFakeDB(
                            pathConfig.starterKitTSXPath,
                            `${pathConfig.fullVersionTSXPath}/src/@fake-db`,
                            'ts'
                          )
                        })
                        .then(() => {
                          copyUserDropdown(
                            pathConfig.starterKitTSXPath,
                            'tsx',
                            pathConfig.fullVersionTSXPath
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

              if(fs.existsSync(file)){
                copyRecursiveSync(file, dest)
              }

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
                              if(fs.existsSync(`${pathConfig.fullVersionJSXPath}/src/${file}`)){
                                copyRecursiveSync(
                                  `${pathConfig.fullVersionJSXPath}/src/${file}`,
                                  `${pathConfig.starterKitJSXPath}/src/${file}`
                                )
                              }
                              resolve()
                            })
                          })

                          Promise.all(folderPromise)
                            .then(() => {
                              copyHomeAndSecondPage()
                            })
                            .then(() => {
                              generateFakeDB(
                                pathConfig.starterKitJSXPath,
                                `${pathConfig.fullVersionJSXPath}/src/@fake-db`,
                                'js'
                              )
                            })
                            .then(() => {
                              copyUserDropdown(
                                pathConfig.starterKitJSXPath,
                                'js',
                                pathConfig.fullVersionJSXPath
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
