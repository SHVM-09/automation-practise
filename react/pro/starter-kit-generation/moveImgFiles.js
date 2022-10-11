const fs = require('fs')
const path = require('path')
const { imgFilesToKeep } = require('./helpers')
const pathConfig = require('../../configs/paths.json')

const dirPathTSX = `${pathConfig.starterKitTSXPath}/src/`

const handleSplitLine = (line, str, increment = 1) => line.findIndex(item => item.trim().includes(str)) + increment

const handleParentPath = path => path.substring(0, path.lastIndexOf('/')).replace(/\\/g, '/').trim()

const getVariableValue = (data, key) => {
  const arr = []
  const splitData = data.split('\r\n')

  splitData.forEach(line => {
    if (line.includes(key)) {
      if (!line.includes('${')) {
        if (line.includes('?')) {
          const splitLine = line.split("'")
          const lineSplitFirstVal = handleSplitLine(splitLine, '?')
          const lineSplitSecondVal = handleSplitLine(splitLine, ':')
          arr.push(splitLine[lineSplitFirstVal])
          arr.push(splitLine[lineSplitSecondVal])
        }

        if (line.endsWith('=')) {
          
          const checkSecondLine = splitData[splitData.indexOf(line) + 1]
          const splitSecondLine = checkSecondLine.split("'")

          const checkThirdLine = splitData[splitData.indexOf(line) + 2]
          const splitThirdLine = checkThirdLine.split("'")

          if (checkSecondLine.includes('?')) {
            const val = handleSplitLine(splitSecondLine, '?')
            arr.push(splitSecondLine[val])
            if (checkSecondLine.includes(':')) {
              const val = handleSplitLine(splitSecondLine, ':')
              arr.push(splitSecondLine[val])
            }
          }

          if (checkThirdLine.trim().length) {
            if (checkThirdLine.includes(':')) {
              const val = handleSplitLine(splitThirdLine, ':')
              arr.push(splitThirdLine[val])
            }
          }
        }
      }
    }
  })

  return arr
}

const checkAndCreate = (imgPath, src, dest) => {
 if(!src.includes('undefined') && !dest.includes('undefined')){
  if (fs.existsSync(imgPath)) {
    fs.copyFileSync(src, dest)
    return
  } else {
    fs.mkdir(imgPath, { recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        fs.copyFileSync(src, dest)
      }
    })
  }
 }
}

const extractImgPath = (line) => {
  if(line.includes('jpg')){
    return {
      path: line.split('/images')[1].split('.jpg')[0],
      extension: 'jpg'
    }
  
  }else if(line.includes('jpeg')){
    return {
      path: line.split('/images')[1].split('.jpeg')[0],
      extension: 'jpeg'
    }
  }
  else if(line.includes('ico')){
    return line.split('/images')[1].split('.ico')[0]
  }else{
    return {
      path: line.split('/images')[1].split('.png')[0],
      extension: 'png'
    }
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
              const pathBetween = extractImgPath(line).path

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

                    const parentPathLight = handleParentPath(replacedLight)
                    const parentPathDark = handleParentPath(replacedDark)

                    checkAndCreate(
                      `${pathConfig.starterKitTSXPath}/public${parentPathLight}`,
                      `${pathConfig.fullVersionTSXPath}/public${replacedLight}`,
                      `${pathConfig.starterKitTSXPath}/public${replacedLight}`
                    )
                    checkAndCreate(
                      `${pathConfig.starterKitTSXPath}/public${parentPathDark}`,
                      `${pathConfig.fullVersionTSXPath}/public${replacedDark}`,
                      `${pathConfig.starterKitTSXPath}/public${replacedDark}`
                    )
                  })
                } else {
                  const imgPath = extractImgPath(line).path
                  const imgPathLight = `/images${imgPath.replace('${theme.palette.mode}', 'light')}.png`.trim()
                  const imgPathDark = `/images${imgPath.replace('${theme.palette.mode}', 'dark')}.png`.trim()

                  const parentPathLight = handleParentPath(imgPathLight)
                  const parentPathDark = handleParentPath(imgPathDark)

                  checkAndCreate(
                    `${pathConfig.starterKitTSXPath}/public${parentPathLight}`,
                    `${pathConfig.fullVersionTSXPath}/public${imgPathLight}`,
                    `${pathConfig.starterKitTSXPath}/public${imgPathLight}`
                  )
                  checkAndCreate(
                    `${pathConfig.starterKitTSXPath}/public${parentPathDark}`,
                    `${pathConfig.fullVersionTSXPath}/public${imgPathDark}`,
                    `${pathConfig.starterKitTSXPath}/public${imgPathDark}`
                  )
                }
              } else {
                const fullPath = `/images${pathBetween}.${extractImgPath(line).extension}`.trim()
                const parentPath = handleParentPath(fullPath)

                checkAndCreate(
                  `${pathConfig.starterKitTSXPath}/public${parentPath}`,
                  `${pathConfig.fullVersionTSXPath}/public${fullPath}`,
                  `${pathConfig.starterKitTSXPath}/public${fullPath}`
                )
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
