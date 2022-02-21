const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')

let demo = 'demo-1'
const i18nPath = `${pathConfig.fullVersionTSXPath}/src/configs/i18n.ts`
const nextConfigPath = `${pathConfig.fullVersionTSXPath}/next.config.js`
const themeConfigPath = `${pathConfig.fullVersionTSXPath}/src/configs/themeConfig.ts`
const settingsContextFile = `${pathConfig.fullVersionTSXPath}/src/@core/context/settingsContext.tsx`

const demoArgs = process.argv.slice(2)

// ** Update demo number
if (demoArgs[0] !== undefined) {
  demo = demoArgs[0]
}

// ** Replace Images src
const replaceBasePathInImages = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = replaceBasePathInImages(dirPath + '/' + file, arrayOfFiles)
    } else {
      fs.readFile(path.join(__dirname, dirPath, '/', file), 'utf-8', (err, data) => {
        if (err) {
          console.error(err)

          return
        } else {
          // const splitData = data.split('\r\n')
          // const lineIndex = splitData.findIndex(i => i.includes('/images/'))
          // splitData[lineIndex] ? splitData[lineIndex].replace('/images/', `${pathConfig.demoURL}/${demo}/images/`) : null
          // if(splitData[lineIndex]){
          //   splitData[lineIndex] = splitData[lineIndex].replace('/images/', `${pathConfig.demoURL}/${demo}/images/`) 
          //   fs.writeFile(path.join(__dirname, dirPath, '/', file), splitData.join('\n'), err => {
          //     if (err) {
          //       console.error(err)

          //       return
          //     }
          //   })
          // }

          const result = data.replace(new RegExp('/images/', 'g'), `${pathConfig.demoURL}/${demo}/images/`)

          fs.writeFile(path.join(__dirname, dirPath, '/', file), result, err => {
            if (err) {

              console.log(err);

              return
            }
          })

          arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
        }
      })
    }
  })

  return arrayOfFiles
}

// ** Replace locales path
const replaceBasePathInI18n = () => {
  fs.readFile(i18nPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)

      return
    } else {
      if (data.includes('/locales/')) {

        fs.writeFile(i18nPath, data.replace('/locales/', `${pathConfig.demoURL}/${demo}/locales/`), err => {
          if (err) {
            console.log(err);

            return
          }
        })
      }
    }
  })
}

replaceBasePathInImages(`${pathConfig.fullVersionTSXPath}/src`)
replaceBasePathInI18n()


// ** Replace settings in localStorage if settingsContextFile exist
if (fs.existsSync(settingsContextFile)) {
  fs.readFile(settingsContextFile, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)

      return
    } else {
      const result = data.replace(new RegExp(/(localStorage.(get|set)Item\(')(.*)('.*\))/, 'g'), `$1settings-${demo}$4`)
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

// ** Replace basePath in nextConfigPath if nextConfigPath exist
if (fs.existsSync(nextConfigPath)) {
  const nextConfigData = fs.readFileSync(nextConfigPath).toString().split('\n')
  const removedBasePathIfAny = nextConfigData.filter(line => {
    return line.indexOf('basePath') === -1
  }).join('\n')
  const result = removedBasePathIfAny.replace('reactStrictMode: false,', `reactStrictMode: false, \n basePath: '${pathConfig.demoURL}/${demo}',`)

  fs.writeFile(nextConfigPath, result, err => {
    if (err) {
      console.log(err)

      return
    }
  })
} else {
  console.log('NextConfig File Does Not Exists')

  return
}

// ** Replace themeConfig file based on demo number
const demoConfigPath = `${pathConfig.demoConfigsPathTSX}/${demo}.ts`

if (fs.existsSync(themeConfigPath) && fs.existsSync(demoConfigPath)) {
  fs.readFile(demoConfigPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err);

      return
    } else {
      fs.writeFile(themeConfigPath, '', (err) => {
        if (err) {
          console.log(err);

          return
        } else {
          fs.writeFile(themeConfigPath, data, (err) => {
            if (err) {
              console.log(err);

              return
            }
          })
        }
      })

    }
  })
} else {
  console.log("themeConfigPath file & demoConfigPath file doesn't exist");
}