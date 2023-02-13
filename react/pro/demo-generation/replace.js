const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const { removeTest, copyTestDirs } = require('../../remove-test/remove-test')
const {
  i18nPath,
  TSGTMHead,
  TSGTMBody,
  PXGTMHead,
  PXGTMBody,
  templateName,
  nextConfigPath,
  themeConfigPath,
  settingsContextFile
} = require('./helpers')

let demo = 'demo-1'
const demoArgs = process.argv.slice(2)
let URL = pathConfig.demoURL

let GTMHead = TSGTMHead
let GTMBody = TSGTMBody

// ** Update demo number
if (demoArgs[0] !== undefined) {
  demo = demoArgs[0]
}

if (demoArgs.length > 1 && demoArgs.includes('staging')) {
  if (!demoArgs.includes('pixinvent')) {
    URL = pathConfig.stagingDemoURL
  } else {
    URL = pathConfig.stagingDemoURL
  }
}

if (demoArgs.length > 1 && demoArgs.includes('pixinvent')) {
  GTMHead = PXGTMHead
  GTMBody = PXGTMBody
  if (!demoArgs.includes('staging')) {
    URL = pathConfig.demoURL
  } else {
    URL = pathConfig.stagingDemoURL
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
      const fileName = path.join(__dirname, dirPath, '/', file)
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          console.error(err)

          return
        } else {
          const result = data.replace(new RegExp('/images/', 'g'), `${URL}/${demo}/images/`)

          fs.writeFile(fileName, result, err => {
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

// ** Replace locales path
const replaceBasePathInI18n = () => {
  return new Promise(resolve => {
    fs.readFile(i18nPath, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)

        return
      } else {
        if (data.includes('/locales/')) {
          fs.writeFile(i18nPath, data.replace('/locales/', `${URL}/${demo}/locales/`), err => {
            if (err) {
              console.log(err)

              return
            }
          })
        }
      }
    })
    resolve()
  })
}

replaceBasePathInImages(`${pathConfig.fullVersionTSXPath}/src`)
replaceBasePathInI18n()
  .then(() => {
    setTimeout(() => {
      fs.readFile(`${pathConfig.fullVersionTSXPath}/src/pages/_document.tsx`, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          fs.writeFile(`${pathConfig.fullVersionTSXPath}/src/pages/_document.tsx`, '', err => {
            if (err) {
              console.log(err)

              return
            } else {
              fs.writeFile(
                `${pathConfig.fullVersionTSXPath}/src/pages/_document.tsx`,
                data
                  .replace('<Head>', '<Head>\n<script dangerouslySetInnerHTML={{ __html: `' + GTMHead + '` }} />')
                  .replace('<body>', '<body>\n' + GTMBody),
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
      })
    }, 500)
  })
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
            `$1${templateName}-settings-${demo}$4`
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
      const nextConfigData = fs.readFileSync(nextConfigPath).toString().split('\n')
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
    const copyTestDirPromise = () =>
      new Promise(resolve => {
        copyTestDirs(false, pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath)
        resolve()
      })

    copyTestDirPromise()
      .then(() => removeTest(pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath))
      .then(() => copyTestDirs(true, pathConfig.fullVersionTSXPath, pathConfig.fullVersionJSXPath))
  })
