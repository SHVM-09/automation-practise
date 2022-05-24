const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const {
  i18nPath,
  copyDirectory,
  nextConfigPath,
  themeConfigPath,
  filesWithTestObj,
  testFoldersToCopy,
  settingsContextFile,
  testFoldersToModify
} = require('./helpers')

let demo = 'demo-1'
const demoArgs = process.argv.slice(2)
let URL = pathConfig.demoURL

// ** Update demo number
if (demoArgs[0] !== undefined) {
  demo = demoArgs[0]
}

if (demoArgs.length > 1 && demoArgs.includes('staging')) {
  if(!demoArgs.includes('pixinvent')){
    URL = pathConfig.stagingDemoURL
  }else{
    URL = `/demo${pathConfig.stagingDemoURL}`
  }
}

if (demoArgs.length > 1 && demoArgs.includes('pixinvent')) {
  if(!demoArgs.includes('staging')){
    URL = `/demo${pathConfig.demoURL}`
  }else{
    URL = `/demo${pathConfig.stagingDemoURL}`
  }
}

// ** Replace Images src
const replaceBasePathInImages = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = replaceBasePathInImages(dirPath + '/' + file, arrayOfFiles)
    } else {
      fs.readFile(
        path.join(__dirname, dirPath, '/', file),
        'utf-8',
        (err, data) => {
          if (err) {
            console.error(err)

            return
          } else {
            const result = data.replace(
              new RegExp('/images/', 'g'),
              `${URL}/${demo}/images/`
            )

            fs.writeFile(
              path.join(__dirname, dirPath, '/', file),
              result,
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

// ** Replace locales path
const replaceBasePathInI18n = () => {
  return new Promise(resolve => {
    fs.readFile(i18nPath, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)

        return
      } else {
        if (data.includes('/locales/')) {
          fs.writeFile(
            i18nPath,
            data.replace('/locales/', `${URL}/${demo}/locales/`),
            err => {
              if (err) {
                console.log(err)

                return
              }
            }
          )
        }
      }
    })
    resolve()
  })
}

replaceBasePathInImages(`${pathConfig.fullVersionTSXPath}/src`)
replaceBasePathInI18n()
  .then(() => {
    // ** Replace settings in localStorage if settingsContextFile exist
    if (fs.existsSync(settingsContextFile)) {
      fs.readFile(settingsContextFile, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)

          return
        } else {
          const result = data.replace(
            new RegExp(/(localStorage.(get|set)Item\(')(.*)('.*\))/, 'g'),
            `$1settings-${demo}$4`
          )
          fs.writeFile(settingsContextFile, result, function (err) {
            if (err) {
              console.log(err)

              return
            }
          })
        }
      })
    } else {
      console.log("settingsContext File Doesn't exists")
    }
  })
  .then(() => {
    // ** Replace basePath in nextConfigPath if nextConfigPath exist
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigData = fs
        .readFileSync(nextConfigPath)
        .toString()
        .split('\n')
      const removedBasePathIfAny = nextConfigData
        .filter(line => {
          return line.indexOf('basePath') === -1
        })
        .join('\n')
      const result = removedBasePathIfAny.replace(
        'reactStrictMode: false,',
        `reactStrictMode: false,\n  basePath: '${URL}/${demo}',`
      )

      fs.writeFile(nextConfigPath, result, err => {
        if (err) {
          console.log(err)

          return
        }
      })
    } else {
      console.log('NextConfig File Does Not Exists')
    }
  })
  .then(() => {
    // ** Replace themeConfig file based on demo number
    const demoConfigPath = `${pathConfig.demoConfigsPathTSX}/${demo}.ts`

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
      console.log("themeConfigPath file & demoConfigPath file doesn't exist")
    }
  })
  .then(() => {
    // ** Removes Test From components & Form Elements
    const removeTest = () => {
      const removePromise = testFoldersToModify.map(folder => {
        return new Promise(resolve => {
          if (fs.existsSync(folder.from)) {
            copyDirectory(folder.from, folder.to)
          }

          resolve()
        })
      })

      Promise.all(removePromise)
        .then(() => {
          testFoldersToModify.map(folder => {
            if (fs.existsSync(folder.from)) {
              fs.rm(folder.from, { recursive: true }, err => {
                if (err) {
                  console.log(err)
                }
              })
            }
          })
        })
        .then(() => {
          filesWithTestObj.map(file => {
            if (fs.existsSync(file)) {
              fs.readFile(file, 'utf-8', (err, data) => {
                if (err) {
                  console.log(err)
                } else {
                  const updatedData = data
                    .replace(/title: 'Test',/g, '')
                    .replace("path: '/components/test'", '')
                    .replace("path: '/forms/form-elements/test'", '')
                    .replace(/[\s]*?{[\s]*?[\s]*?}/g, '')
                  fs.writeFile(file, '', err => {
                    if (err) {
                      console.log(err)
                    }

                    fs.writeFile(file, updatedData, err => {
                      if (err) {
                        console.log(err)
                      }
                    })
                  })
                }
              })
            }
          })
        })
        .then(() => {
          testFoldersToCopy.map(folder => {
            if (fs.existsSync(folder.from)) {
              copyDirectory(folder.from, folder.to)
            }
          })
        })
    }

    removeTest()
  })
