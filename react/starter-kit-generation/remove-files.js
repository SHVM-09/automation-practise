const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')
const { filesToRemove, imgFilesToKeep } = require('./helpers')

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

const removeUnwantedImgFiles = dirPath => {
  files = fs.readdirSync(dirPath)

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      removeUnwantedImgFiles(dirPath + '/' + file)
    } else {
      const imagePath = dirPath + '/' + file
      const imageToKeep = imagePath.substring(
        imagePath.lastIndexOf('images') - 1
      )
      if (!imgFilesToKeep.includes(imageToKeep)) {
        fs.rmSync(imagePath)
      }
    }
  })

  cleanEmptyFoldersRecursively(dirPath)
}

// ** Delete Files
const deleteFiles = () => {
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
}

deleteFiles()
removeUnwantedImgFiles(`${pathConfig.starterKitTSXPath}/public/images`)

if (fs.existsSync(`${pathConfig.starterKitJSXPath}/public/images`)) {
  removeUnwantedImgFiles(`${pathConfig.starterKitJSXPath}/public/images`)
}
