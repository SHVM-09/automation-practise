const fs = require('fs')
const pathConfig = require('../../configs/paths.json')
const demoConfigPath = '../../configs/demoConfigs.json'
const defaultConfigPathTSX = `${pathConfig.fullVersionTSXPath}/src/configs/themeConfig.ts`
const defaultConfigPathJSX = `${pathConfig.fullVersionJSXPath}/src/configs/themeConfig.js`

// ** Generates demo configs based on version, demoConfigs folder & default themeConfig(src/configs/themeConfig)
const generateDemoConfigs = (version, demoConfigsFolder, defaultConfigPath) => {
  return new Promise(resolve => {
    if (fs.existsSync(demoConfigPath)) {
      fs.readFile(demoConfigPath, 'utf8', (err, demoConfigString) => {
        if (err) {
          console.log(err)
        } else {
          const demoData = JSON.parse(demoConfigString)
          const generateConfigs = () => {
            Object.keys(demoData).forEach(key => {
              const demoNumber = key.replace('demo-', '')

              const fileName = `${demoConfigsFolder}/demo-${demoNumber}.${version}`

              if (fs.existsSync(defaultConfigPath)) {
                fs.readFile(
                  defaultConfigPath,
                  'utf-8',
                  (err, defaultConfigData) => {
                    const linesToReplace = []
                    let dataToWrite = defaultConfigData

                    Object.keys(demoData[key]).forEach(val => {
                      const splitData = defaultConfigData.split('\n')
                      const lineIndex = splitData.findIndex(
                        i => i.includes(val) && i.includes('/*')
                      )
                      const valToReplace = splitData[lineIndex]
                        ? splitData[lineIndex].match(/'(\w+)'/)[1]
                        : null

                      if (splitData[lineIndex] && valToReplace) {
                        linesToReplace.push({
                          line: splitData[lineIndex],
                          replacement: splitData[lineIndex].replace(
                            valToReplace,
                            demoData[key][val]
                          )
                        })
                      }
                    })

                    linesToReplace.forEach(r => {
                      dataToWrite = dataToWrite.replace(r.line, r.replacement)
                    })

                    fs.writeFile(fileName, dataToWrite, err => {
                      if (err) {
                        console.log(err)

                        return
                      }
                    })
                  }
                )
              }
            })
          }
          if (fs.existsSync(demoConfigsFolder)) {
            generateConfigs()
          } else {
            fs.mkdir(
              demoConfigsFolder,
              { recursive: true, force: true },
              err => {
                if (err) {
                  console.log(err)

                  return
                } else {
                  generateConfigs()
                }
              }
            )
          }
        }
      })
    }

    resolve()
  })
}

// ** Generate Demo Configs for TypeScript version
generateDemoConfigs(
  'ts',
  pathConfig.demoConfigsPathTSX,
  defaultConfigPathTSX
).then(() => {
  // ** Generate Demo Configs for Javascript version
  if (fs.existsSync(pathConfig.basePathJSX)) {
    generateDemoConfigs(
      'js',
      pathConfig.demoConfigsPathJSX,
      defaultConfigPathJSX
    )
  }
})
