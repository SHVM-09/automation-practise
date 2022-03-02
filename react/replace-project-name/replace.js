const fs = require('fs')
const path = require('path')

const passedArgs = process.argv

const dirsToRead = '../../react'

const replaceProjectName = (dirPath, defaultProjectName, projectName) => {
  files = fs.readdirSync(dirPath)

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      replaceProjectName(dirPath + '/' + file, defaultProjectName, projectName)
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
              new RegExp(defaultProjectName, 'g'),
              projectName
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
          }
        }
      )
    }
  })
}

// ** If any args then update arg var
if (passedArgs[0] !== undefined) {
  const projectName = passedArgs.slice(-1)[0]
  const defaultProjectName = passedArgs.slice(-2)[0]
  replaceProjectName(dirsToRead, defaultProjectName, projectName)
} else {
  console.log(
    'Please pass a default  project name & project name as an argument'
  )
}
