const fs = require('fs')
const pathConfig = require('../../configs/paths.json')
const { dataToReplace, filesToReplace } = require('./helpers')

// ** Replace Content in files
const replaceFileContent = () => {
  dataToReplace.forEach(obj => {
    if (fs.existsSync(obj.file)) {
      fs.readFile(obj.file, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)

          return
        } else {
          let result = data
          obj.replacements.forEach(rep => {
            result = result.replace(rep.from, rep.to)
          })
          fs.writeFile(obj.file, '', err => {
            if (err) {
              console.log(err)

              return
            } else {
              fs.writeFile(obj.file, result, err => {
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
}

// ** Extract Icon from line
const extractIcon = (data, title) => {
  const getIconLine = line => {
    if (data[titleLine - 1].includes('icon')) {
      return data[titleLine - 1]
    } else {
      return data[titleLine + 1]
    }
  }

  const titleLine = data.findIndex(line => line.includes(title))
  const icon = getIconLine(titleLine).trim().replace('{', '').replace('},', '').replace("icon: '", '').replace("',", '')

  return icon
}

// ** Replaces whole files
const replaceFiles = () => {
  return new Promise(resolve => {
    filesToReplace.map(file => {
      if (fs.existsSync(file.src)) {
        fs.copyFile(file.src, file.dest, err => {
          if (err) {
            console.log(err)
          }
        })
      }
    })
    resolve()
  }).then(() => {
    const arr = [
      `${pathConfig.starterKitTSXPath}/src/navigation/vertical/index.ts`,
      `${pathConfig.starterKitTSXPath}/src/navigation/horizontal/index.ts`,
      `${pathConfig.starterKitJSXPath}/src/navigation/vertical/index.js`,
      `${pathConfig.starterKitJSXPath}/src/navigation/horizontal/index.js`
    ]

    arr.map(file => {
      const fullVersionPath = file.replace('starter-kit', 'full-version')
      if (fs.existsSync(file) && fs.existsSync(fullVersionPath)) {
        fs.readFile(fullVersionPath, 'utf-8', (err, dataFullV) => {
          if (err) {
            console.log(err)
          } else {
            const splitDestData = dataFullV.split('\n')
            const homeIcon = extractIcon(splitDestData, "title: 'Dashboards'")
            const secondPageIcon = extractIcon(splitDestData, "title: 'Email'")
            const ACLIcon = extractIcon(splitDestData, "title: 'Access Control'")

            fs.readFile(file, 'utf-8', (err, dataStarter) => {
              const replaced = dataStarter
                .replace('mdi:home-outline', homeIcon)
                .replace('mdi:email-outline', secondPageIcon)
                .replace('mdi:shield-outline', ACLIcon)

              fs.writeFile(file, replaced, err => {
                if (err) {
                  console.log(err)

                  return
                }
              })
            })
          }
        })
      }
    })
  })
}

replaceFiles()
  .then(() => replaceFileContent())
  .then(() => {
    const arr = [
      `${pathConfig.starterKitTSXPath}/src/layouts/components/vertical/AppBarContent.tsx`,
      `${pathConfig.starterKitJSXPath}/src/layouts/components/vertical/AppBarContent.js`
    ]

    arr.map(file => {
      if (fs.existsSync(file)) {
        const fullVersionPath = file.replace('starter-kit', 'full-version')
        fs.readFile(file, 'utf-8', (err, dataStarter) => {
          fs.readFile(fullVersionPath, 'utf-8', (err, dataFullV) => {
            if (err) {
              console.log(err)
            } else {
              const splitStarterFile = dataStarter.split('\n')
              const starterIconLine = splitStarterFile.find(line => line.includes('Icon icon='))
              const splitFullVFile = dataFullV.split('\n')
              const fullVIconLine = splitFullVFile.find(line => line.includes('Icon icon='))

              const result = dataStarter.replace(starterIconLine, fullVIconLine)

              fs.writeFile(file, result, err => {
                if (err) {
                  console.log(err)

                  return
                } else {
                  console.log('Done')
                }
              })
            }
          })
        })
      }
    })
  })
