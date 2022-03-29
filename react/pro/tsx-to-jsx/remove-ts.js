const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')

const srcDirPath = `${pathConfig.fullVersionJSXPath}/src`
const packageFilePath = `${pathConfig.fullVersionJSXPath}/package.json`

// ** Removes type/types.js files
const removeTypeFiles = function (dir, callback) {
  return new Promise(resolve => {
    fs.readdir(dir, function (err, list) {
      if (err) return callback(err)
      var i = 0
      ;(function done() {
        var file = list[i++]
        if (!file) return callback(null)
        file = path.resolve(dir, file)
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {
            removeTypeFiles(file, function (err, res) {
              done()
            })
          } else {
            if (file.endsWith('types.js') || file.endsWith('type.js')) {
              fs.unlinkSync(file)
            }
            done()
          }
        })
      })()
    })
    resolve()
  })
}

const removeTypesFolder = () => {
  fs.rmSync(`${pathConfig.fullVersionJSXPath}/src/types`, {
    force: true,
    recursive: true
  })
}

removeTypeFiles(srcDirPath, () => console.log('Removed Type Files'))
  .then(() => {
    removeTypesFolder()
  })
  .then(() => {
    // ** Remove ts and tsx extensions from yarn format and yarn lint commands from package.json file
    if (fs.existsSync(packageFilePath)) {
      fs.readFile(packageFilePath, 'utf8', function (err, data) {
        if (err) {
          return console.log(err)
        }

        const result = data.replace(/,ts,tsx/g, '')

        let finalResult = result.replace(
          new RegExp(/(\r\n|\n|\r)\s*("(@types|typescript))(.*)/, 'g'),
          ``
        )

        const dataToWrite = finalResult.replace(/\,(?!\s*?[\{\[\"\'\w])/g, '')

        fs.writeFile(packageFilePath, dataToWrite, 'utf8', function (err) {
          if (err) return console.log(err)
        })
      })
    }
  })
  .then(() => {
    // ** Change files extension from jsx to js
    function renameFiles(dirPath) {
      files = fs.readdirSync(dirPath)

      files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
          renameFiles(dirPath + '/' + file)
        } else {
          if (path.extname(file) === '.jsx') {
            const newFile = file.replace(/\.[^.]+$/, '.js')
            fs.rename(dirPath + '/' + file, dirPath + '/' + newFile, err => {
              if (err) throw err
            })
          }
        }
      })
    }

    renameFiles(srcDirPath)
  })
  .then(() => console.log('Removed TS Files'))
