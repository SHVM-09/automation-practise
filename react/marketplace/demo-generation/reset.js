const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const { resetTestDirs } = require('../../remove-test/remove-test')
const {
  i18nPath,
  dataToReset,
  demoConfigPath,
  nextConfigPath,
  themeConfigPath,
  settingsContextFile,
} = require('./helpers')

let demo = 'demo-1'

const demoArgs = process.argv.slice(2)
let URL = pathConfig.demoURL

// ** Update demo number
if (demoArgs[0] !== undefined) {
  demo = demoArgs[0]
}

if (demoArgs.length > 1 && demoArgs.includes('staging')) {
  URL = pathConfig.stagingDemoURL
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
              new RegExp(`/marketplace${URL}/${demo}/images/`, 'g'),
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
  return new Promise(resolve => {
    fs.readFile(i18nPath, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)

        return
      } else {
        const updatedData = data.replace(
          `/marketplace${URL}/${demo}/locales/`,
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

    resolve()
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

 const resetTestDirPromise = () => new Promise(resolve => {
  resetTestDirs(false, pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath)
  resolve()
})

resetTestDirPromise()
.then(() => resetTestDirs(true, pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath))

  // ** Reset replaced basePath if nextConfigPath exist
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigData = fs
      .readFileSync(nextConfigPath)
      .toString()
      .split('\n')

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