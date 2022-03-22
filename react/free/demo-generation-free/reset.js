const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const nextConfigPath = `${pathConfig.basePathTSX}/next.config.js`

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
              new RegExp(`${pathConfig.demoURL}/images/`, 'g'),
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

removeBasePathInImages(`${pathConfig.basePathTSX}/src`)

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
