const fs = require('fs')
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
  })
}




replaceFiles().then(() => replaceFileContent())
