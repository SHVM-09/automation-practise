const fs = require('fs')
const path = require('path')

const passedArgs = process.argv

const dirsToRead = '../../react'

const replaceProjectName = (dirPath, projectName) => {
  files = fs.readdirSync(dirPath)

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      replaceProjectName(dirPath + '/' + file, projectName)
    } else {
      if (!dirPath.includes('replace-project-name')) {
        fs.readFile(
          path.join(__dirname, dirPath, '/', file),
          'utf-8',
          (err, data) => {
            if (err) {
              console.error(err)

              return
            } else {
              const result = data.replace(
                new RegExp(/[a-zA-z-_]*-template|master-react-mui-nextjs/, 'g'),
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
    }
  })
}

// ** If any args then update arg var
if (passedArgs[0] !== undefined) {
  const projectName = passedArgs.slice(-1)[0]
  replaceProjectName(dirsToRead, projectName)
} else {
  console.log('Please pass a project name as an argument')
}
