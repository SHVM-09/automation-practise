const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const { resetTestDirs } = require('../../remove-test/remove-test')
const { i18nPath, demoConfigPath, nextConfigPath, themeConfigPath, settingsContextFile } = require('./helpers')

let demo = 'demo-1'

const demoArgs = process.argv.slice(2)
let URL = pathConfig.demoURL

// ** Update demo number
if (demoArgs[0] !== undefined) {
  demo = demoArgs[0]
}

if (demoArgs.length > 1 && demoArgs.includes('staging')) {
  if (!demoArgs.includes('pixinvent')) {
    URL = pathConfig.stagingDemoURL
  } else {
    URL = `/demo${pathConfig.stagingDemoURL}`
  }
}

if (demoArgs.length > 1 && demoArgs.includes('pixinvent')) {
  if (!demoArgs.includes('staging')) {
    URL = `/demo${pathConfig.demoURL}`
  } else {
    URL = `/demo${pathConfig.stagingDemoURL}`
  }
}

// ** Reset replaced Images src
const removeBasePathInImages = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = removeBasePathInImages(dirPath + '/' + file, arrayOfFiles)
    } else {
      const fileName = path.join(__dirname, dirPath, '/', file)
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          console.error(err)

          return
        } else {
          const updatedData = data.replace(new RegExp(`${URL}/${demo}/images/`, 'g'), '/images/')
          fs.writeFile(fileName, updatedData, err => {
            if (err) {
              console.log(err)

              return
            }
          })

          arrayOfFiles.push(fileName)
        }
      })
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
        const updatedData = data.replace(`${URL}/${demo}/locales/`, '/locales/')
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

removeBasePathInImages(`${pathConfig.fullVersionTSXPath}/src`)
removeBasePathInI18n()
  .then(() => {
    // ** Reset replaced settings in localStorage if settingsContextFile exist
    if (fs.existsSync(settingsContextFile)) {
      fs.readFile(settingsContextFile, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)

          return
        } else {
          const result = data.replace(new RegExp(/(localStorage.(get|set)Item\(')(.*)('.*\))/, 'g'), `$1settings$4`)
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
  })
  .then(() => {
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
  })
  .then(() => {
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
  })
  .then(() => {
    // ** Adds Test to components & Form Elements

    const resetTestDirPromise = () =>
      new Promise(resolve => {
        resetTestDirs(false, pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath)
        resolve()
      })

    resetTestDirPromise().then(() => resetTestDirs(true, pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath))
  })
