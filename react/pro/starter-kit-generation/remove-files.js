const fs = require('fs')
const path = require('path')
const { filesToRemove } = require('./helpers')

const cleanEmptyFoldersRecursively = folder => {
  const isDir = fs.statSync(folder).isDirectory()
  if (!isDir) {
    return
  }
  let files = fs.readdirSync(folder)
  if (files.length > 0) {
    files.forEach(function (file) {
      const fullPath = path.join(folder, file)
      cleanEmptyFoldersRecursively(fullPath)
    })
    files = fs.readdirSync(folder)
  }

  if (files.length == 0) {
    fs.rmdirSync(folder)
    return
  }
}



// ** Delete Files
const deleteFiles = () => {
  return new Promise(resolve => {
    filesToRemove.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlink(file, err => {
          if (err) {
            console.log(err)

            return
          }
        })
      }
    })
    resolve()
  })
}

deleteFiles()
