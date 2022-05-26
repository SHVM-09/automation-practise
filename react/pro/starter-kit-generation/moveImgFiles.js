const fs = require('fs')
const path = require('path')
const { imgFilesToKeep } = require('./helpers')
const pathConfig = require('../../configs/paths.json')

const dirPathTSX = `${pathConfig.starterKitTSXPath}/src/`

const getVariableValue = (data, key) => {
  const arr = []
  const splitData = data.split('\n')

  splitData.forEach(line => {
    
    if (line.includes(key) ) {
      
      if(!line.includes('${')) {
        if (line.includes('?')) {
          const splitLine = line.split("'")
          const lineSplitFirstVal = splitLine.findIndex(item => item.trim().includes('?')) + 1
          const lineSplitSecondVal = splitLine.findIndex(item => item.trim().includes(':')) + 1
          arr.push(splitLine[lineSplitFirstVal])
          arr.push(splitLine[lineSplitSecondVal])
        }
  
        if (line.endsWith('=')) {
          
          const checkSecondLine = splitData[splitData.indexOf(line) + 1]
          const splitSecondLine = checkSecondLine.split("'")
  
          const checkThirdLine = splitData[splitData.indexOf(line) + 2]
          const splitThirdLine = checkThirdLine.split("'")
  
          if (checkSecondLine.includes('?')) {
            const val = splitSecondLine.findIndex(item => item.trim().includes('?')) + 1
            arr.push(splitSecondLine[val])
            if(checkSecondLine.includes(':')){
              const val = splitSecondLine.findIndex(item => item.trim().includes(':')) + 1
              arr.push(splitSecondLine[val])
            }
          }
          
          if(checkThirdLine.trim().length){
            if (checkThirdLine.includes(':')) {
              const val = splitThirdLine.findIndex(item => item.trim().includes(':')) + 1
              arr.push(splitThirdLine[val])
            }
          }
        }
      }

    }
  })
  
  return arr
}

const checkAndCreate = (imgPath, callback) => {
  if (fs.existsSync(imgPath)) {
    callback()
    return
  } else {
    fs.mkdir(imgPath, { recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        callback()
      }
    })
  }
}

// ** find move required images to starterKit
const moveImgFiles = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = moveImgFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      fs.readFile(path.join(__dirname, dirPath, '/', file), 'utf-8', (err, data) => {
        if (err) {
          console.error(err)

          return
        } else {
          const splitData = data.split('\n')
          splitData.map(line => {
            if (line.includes('/images/')) {
              const pathBetween = line.split('/images')[1].split('.png')[0]

              if (line.includes('${')) {
                const variableName = line.split('${')[1].split('}')[0]
                if (variableName !== 'theme.palette.mode') {
                  getVariableValue(data, variableName).map(r => {
                    const replaced = line
                      .replace('src=', '')
                      .replace('{`', '')
                      .replace('`}', '')
                      .replace('${' + variableName + '}', r)
                    const replacedLight = replaced.replace('${theme.palette.mode}', 'light').trim()
                    const replacedDark = replaced.replace('${theme.palette.mode}', 'dark').trim()

                    const parentPathLight = replacedLight
                      .substring(0, replacedLight.lastIndexOf('/'))
                      .replace(/\\/g, '/')
                      .trim()
                    const parentPathDark = replacedDark
                      .substring(0, replacedDark.lastIndexOf('/'))
                      .replace(/\\/g, '/')
                      .trim()

                    checkAndCreate(`${pathConfig.starterKitTSXPath}/public${parentPathLight}`, () => {
                      fs.copyFileSync(
                        `${pathConfig.fullVersionTSXPath}/public${replacedLight}`,
                        `${pathConfig.starterKitTSXPath}/public${replacedLight}`
                      )
                    })
                    checkAndCreate(`${pathConfig.starterKitTSXPath}/public${parentPathDark}`, () => {
                      fs.copyFileSync(
                        `${pathConfig.fullVersionTSXPath}/public${replacedDark}`,
                        `${pathConfig.starterKitTSXPath}/public${replacedDark}`
                      )
                    })
                  })
                } else {
                  const imgPath = line.split('/images')[1].split('.png')[0]
                  const imgPathLight = `/images${imgPath.replace('${theme.palette.mode}', 'light')}.png`.trim()
                  const imgPathDark = `/images${imgPath.replace('${theme.palette.mode}', 'dark')}.png`.trim()

                  const parentPathLight = imgPathLight
                    .substring(0, imgPathLight.lastIndexOf('/'))
                    .replace(/\\/g, '/')
                    .trim()
                  const parentPathDark = imgPathDark
                    .substring(0, imgPathDark.lastIndexOf('/'))
                    .replace(/\\/g, '/')
                    .trim()

                  checkAndCreate(`${pathConfig.starterKitTSXPath}/public${parentPathLight}`, () => {
                    fs.copyFileSync(
                      `${pathConfig.fullVersionTSXPath}/public${imgPathLight}`,
                      `${pathConfig.starterKitTSXPath}/public${imgPathLight}`
                    )
                  })
                  checkAndCreate(`${pathConfig.starterKitTSXPath}/public${parentPathDark}`, () => {
                    fs.copyFileSync(
                      `${pathConfig.fullVersionTSXPath}/public${imgPathDark}`,
                      `${pathConfig.starterKitTSXPath}/public${imgPathDark}`
                    )
                  })
                }
              } else {
                const fullPath = `/images${pathBetween}.png`.trim()
                const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/')).replace(/\\/g, '/').trim()

                checkAndCreate(`${pathConfig.starterKitTSXPath}/public${parentPath}`, () => {
                  fs.copyFileSync(
                    `${pathConfig.fullVersionTSXPath}/public${fullPath}`,
                    `${pathConfig.starterKitTSXPath}/public${fullPath}`
                  )
                })
              }
            }
          })
        }
      })
    }
  })
}

const generate = () => {
  const imgPromise = new Promise((resolve, reject) => {
    moveImgFiles(dirPathTSX)
    resolve()
  })

  imgPromise.then(() => {
    setTimeout(() => {
      imgFilesToKeep.map(file => {
        if (fs.existsSync(`${pathConfig.starterKitTSXPath}/public`)) {
          fs.copyFileSync(`${pathConfig.fullVersionTSXPath}${file}`, `${pathConfig.starterKitTSXPath}${file}`)
        }
      })
    }, 500)
  })
}

generate()
