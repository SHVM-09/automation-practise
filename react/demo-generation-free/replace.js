const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')
const nextConfigPath = `${pathConfig.basePathTSX}/next.config.js`

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
              `${pathConfig.demoURL}/images/`
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

replaceBasePathInImages(`${pathConfig.basePathTSX}/src`)

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
    `reactStrictMode: false,\n  basePath: '${pathConfig.demoURL}',`
  )

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
