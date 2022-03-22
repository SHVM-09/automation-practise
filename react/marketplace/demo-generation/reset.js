const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const {
  i18nPath,
  copyDirectory,
  dataToReset,
  demoConfigPath,
  nextConfigPath,
  themeConfigPath,
  testFoldersToCopy,
  settingsContextFile,
  testFoldersToModify
} = require('./helpers')

let demo = 'demo-1'

const demoArgs = process.argv.slice(2)

// ** Update demo number
if (demoArgs[0] !== undefined) {
  demo = demoArgs[0]
}

// ** Reset replaced Images src
const removeBasePathInImages = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = removeBasePathInImages(dirPath + '/' + file, arrayOfFiles)
    } else {
      fs.readFile(
        path.join(__dirname, dirPath, '/', file),
        'utf-8',
        (err, data) => {
          if (err) {
            console.error(err)

            return
          } else {
            const updatedData = data.replace(
              new RegExp(
                `/marketplace${pathConfig.demoURL}/${demo}/images/`,
                'g'
              ),
              '/images/'
            )
            fs.writeFile(
              path.join(__dirname, dirPath, '/', file),
              updatedData,
              err => {
                if (err) {
                  console.log(err)

                  return
                }
              }
            )

            arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
          }
        }
      )
    }
  })

  return arrayOfFiles
}

// ** Reset replaced locales path
const removeBasePathInI18n = () => {
  fs.readFile(i18nPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)

      return
    } else {
      const updatedData = data.replace(
        `/marketplace${pathConfig.demoURL}/${demo}/locales/`,
        '/locales/'
      )
      fs.writeFile(i18nPath, '', err => {
        if (err) {
          console.log(err)

          return
        } else {
          fs.writeFile(i18nPath, updatedData, err => {
            if (err) {
              console.log(err)

              return
            }
          })
        }
      })
    }
  })
}

// ** Replace With MarketPlace URLS
const replaceWithMarketPlace = () => {
  dataToReset.map(i => {
    if (fs.existsSync(i.file)) {
      fs.readFile(i.file, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          let result = data

          i.replacements.map(rep => {
            result = result.replace(rep.from, rep.to)
          })

          fs.writeFile(i.file, '', err => {
            if (err) {
              console.log(err)
            } else {
              fs.writeFileSync(i.file, result)
            }
          })
        }
      })
    }
  })
}

removeBasePathInImages(`${pathConfig.fullVersionTSXPath}/src`)
removeBasePathInI18n()
replaceWithMarketPlace()

// ** Reset replaced settings in localStorage if settingsContextFile exist
if (fs.existsSync(settingsContextFile)) {
  fs.readFile(settingsContextFile, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)

      return
    } else {
      const result = data.replace(
        new RegExp(/(localStorage.(get|set)Item\(')(.*)('.*\))/, 'g'),
        `$1settings$4`
      )
      fs.writeFile(settingsContextFile, '', err => {
        if (err) {
          console.log(err)

          return
        } else {
          fs.writeFile(settingsContextFile, result, function (err) {
            if (err) {
              console.log(err)

              return
            }
          })
        }
      })
    }
  })
}

// ** Reset replaced basePath if nextConfigPath exist
if (fs.existsSync(nextConfigPath)) {
  const nextConfigData = fs.readFileSync(nextConfigPath).toString().split('\n')

  const result = nextConfigData
    .filter(line => {
      return line.indexOf('basePath') === -1
    })
    .join('\n')

  fs.writeFile(nextConfigPath, result, err => {
    if (err) {
      console.log(err)

      return
    }
  })
} else {
  console.log('NextConfig file Does Not Exists')
}

// ** Reset replaced themeConfig if themeConfigPath & demoConfigPath exist
if (fs.existsSync(themeConfigPath) && fs.existsSync(demoConfigPath)) {
  fs.readFile(demoConfigPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)

      return
    } else {
      fs.writeFile(themeConfigPath, '', err => {
        if (err) {
          console.log(err)

          return
        } else {
          fs.writeFile(themeConfigPath, data, err => {
            if (err) {
              console.log(err)

              return
            }
          })
        }
      })
    }
  })
} else {
  console.log('themeConfigPath file & demoConfigPath file Does Not Exists')
}

// ** Adds Test to components & Form Elements
const resetTestFolders = () => {
  const resetPromise = testFoldersToModify.map(folder => {
    return new Promise(resolve => {
      if (fs.existsSync(folder.to)) {
        copyDirectory(folder.to, folder.from)
      }

      resolve()
    })
  })

  Promise.all(resetPromise)
    .then(() => {
      testFoldersToCopy.map(folder => {
        if (fs.existsSync(folder.to)) {
          copyDirectory(folder.to, folder.from)
        }
      })
    })
    .then(() => {
      if (fs.existsSync(`./${pathConfig.demoURL}`)) {
        fs.rm(`./${pathConfig.demoURL}`, { recursive: true }, err => {
          if (err) {
            console.log(err)
          }
        })
      }
    })
}

resetTestFolders()
