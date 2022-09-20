const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')

const copyDirectory = (source, destination) => {
  fs.mkdirSync(destination, {
    recursive: true
  })

  fs.readdirSync(source, {
    withFileTypes: true
  }).forEach(entry => {
    let sourcePath = path.join(source, entry.name)
    let destinationPath = path.join(destination, entry.name)

    entry.isDirectory() ? copyDirectory(sourcePath, destinationPath) : fs.copyFileSync(sourcePath, destinationPath)
  })
}

const cleanEmptyFoldersRecursively = folder => {
  const isDir = fs.existsSync(folder) && fs.statSync(folder).isDirectory()
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

const testFolders = [
  'src/pages/ui/icons-test',
  'src/views/components/test',
  'src/pages/components/test',
  'src/pages/forms/form-elements/test',
  'src/views/forms/form-elements/test'
]

const filesWithTestObj = [
  { folder: 'src/navigation/vertical', fileName: 'index' },
  { folder: 'src/navigation/horizontal', fileName: 'index' },
  { folder: 'src/@fake-db/server-side-menu', fileName: 'vertical' },
  { folder: 'src/@fake-db/server-side-menu', fileName: 'horizontal' }
]

const copyTestDirs = (nav = false, pathTSX, pathJSX) => {
  const formattedPathTSX = pathTSX.replace('../../../../', '')
  const formattedPathJSX = pathJSX.replace('../../../../', '')

  if (!nav) {
    testFolders.map(folder => {
      const tempPathTSX = `./temp-folder/${formattedPathTSX}/${folder}`
      const tempPathJSX = `./temp-folder/${formattedPathJSX}/${folder}`
      if (fs.existsSync(`${pathTSX}/${folder}`)) {
        copyDirectory(`${pathTSX}/${folder}`, tempPathTSX)
      }
      if (fs.existsSync(`${pathJSX}/${folder}`)) {
        copyDirectory(`${pathJSX}/${folder}`, tempPathJSX)
      }
    })
  } else {
    filesWithTestObj.map(obj => {
      const pathToCopyFromTSX = `${pathTSX}/${obj.folder}`
      const pathToCopyFromJSX = `${pathJSX}/${obj.folder}`
      const tempPathTSX = `./temp-folder/${formattedPathTSX}/${obj.folder}`
      const tempPathJSX = `./temp-folder/${formattedPathJSX}/${obj.folder}`
      if (fs.existsSync(pathToCopyFromTSX)) {
        copyDirectory(pathToCopyFromTSX, tempPathTSX)
      }
      if (fs.existsSync(pathToCopyFromJSX)) {
        copyDirectory(pathToCopyFromJSX, tempPathJSX)
      }
    })
  }
}

const resetTestDirs = (nav = false, pathTSX, pathJSX) => {
  const formattedPathTSX = pathTSX.replace('../../../../', '')
  const formattedPathJSX = pathJSX.replace('../../../../', '')

  const handleCopyTest = () =>
    new Promise(resolve => {
      if (!nav) {
        testFolders.map(folder => {
          const tempPathTSX = `./temp-folder/${formattedPathTSX}/${folder}`
          const tempPathJSX = `./temp-folder/${formattedPathJSX}/${folder}`
          if (fs.existsSync(tempPathTSX)) {
            copyDirectory(tempPathTSX, `${pathTSX}/${folder}`)
          }
          if (fs.existsSync(tempPathJSX)) {
            copyDirectory(tempPathJSX, `${pathJSX}/${folder}`)
          }
        })
      } else {
        const copyPromise = () =>
          new Promise(resolve => {
            filesWithTestObj.map(obj => {
              const pathToCopyFromTSX = `${pathTSX}/${obj.folder}`
              const pathToCopyFromJSX = `${pathJSX}/${obj.folder}`
              const tempPathTSX = `./temp-folder/${formattedPathTSX}/${obj.folder}`
              const tempPathJSX = `./temp-folder/${formattedPathJSX}/${obj.folder}`

              if (fs.existsSync(tempPathTSX)) {
                copyDirectory(tempPathTSX, pathToCopyFromTSX)
              }
              if (fs.existsSync(tempPathJSX)) {
                copyDirectory(tempPathJSX, pathToCopyFromJSX)
              }
            })
            resolve()
          })

        copyPromise().then(() => {
          if (fs.existsSync('./temp-folder')) {
            fs.rmSync('./temp-folder', { recursive: true })
          }
          console.log('Done')
        })
      }
      resolve()
    })

  handleCopyTest()
}

const copyNavDirs = (pathTSX, pathJSX) => {
  const formattedPathTSX = pathTSX.replace('../../../../', '')
  const formattedPathJSX = pathJSX.replace('../../../../', '')

  filesWithTestObj.map(obj => {
    return new Promise(resolve => {
      if (fs.existsSync(`${pathTSX}/${obj.folder}`)) {
        copyDirectory(`${pathTSX}/${obj.folder}`, `./temp-folder/${formattedPathTSX}/${obj.folder}`)
      }
      if (fs.existsSync(`${pathJSX}/${obj.folder}`)) {
        copyDirectory(`${pathJSX}/${obj.folder}`, `./temp-folder/${formattedPathJSX}/${obj.folder}`)
      }
      resolve()
    })
  })
}

const replaceTest = file => {
  if (fs.existsSync(file)) {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
      } else {
        const updatedData = data
          .replace(/title: 'Test',[\s\S].*/g, '')
          .replace(/title: 'Icons Test',[\s\S].*[\s\S].*[\s\S].*[\s\S].*/g, '')
          .replace(/path: '.*\/test'.*/g, '')
          .replace(/[\s]*?{[\s]*?[\s]*?}/g, '')
          .replace(/,,/g, ',')

        fs.writeFile(file, '', err => {
          if (err) {
            console.log(err)
          }
          fs.writeFile(file, updatedData, err => {
            if (err) {
              console.log(err)
            }
          })
        })
      }
    })
  }
}

const removeTest = (pathTSX, pathJSX, package = false) => {
  setTimeout(() => {
    const removePromise = testFolders.map(folder => {
      if (fs.existsSync(`${pathTSX}/${folder}`)) {
        fs.rmSync(`${pathTSX}/${folder}`, {
          recursive: true
        })
      }
      if (fs.existsSync(`${pathJSX}/${folder}`)) {
        fs.rmSync(`${pathJSX}/${folder}`, {
          recursive: true
        })
      }
    })

    Promise.all(removePromise)
      .then(() => {
        filesWithTestObj.map(obj => {
          const fileTSX = `${pathTSX}/${obj.folder}/${obj.fileName}.ts`
          const fileJSX = `${pathJSX}/${obj.folder}/${obj.fileName}.js`
          replaceTest(fileTSX)
          replaceTest(fileJSX)
        })
      })
      .then(() => {
        filesWithTestObj.map(obj => {
          cleanEmptyFoldersRecursively(`${pathTSX}/${obj.folder}`)
          cleanEmptyFoldersRecursively(`${pathJSX}/${obj.folder}`)
        })
      })
  }, 2000)
}

module.exports = {
  removeTest,
  copyNavDirs,
  copyTestDirs,
  resetTestDirs
}
