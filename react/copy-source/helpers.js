const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')

const basePathJSX = pathConfig.basePathJSX
const componentsPathTSX = `${pathConfig.fullVersionTSXPath}/src/views/components/`
const formsPathTSX = `${pathConfig.fullVersionTSXPath}/src/views/forms/form-elements/`
const componentsPathJSX = `${pathConfig.fullVersionJSXPath}/src/views/components/`
const formsPathJSX = `${pathConfig.fullVersionJSXPath}/src/views/forms/form-elements/`

// ** Checks for javascript-version directory and returns boolean
const doesJSXVersionExits = fs.existsSync(basePathJSX)

// ** Returns files with source code.
const getAllFilesWithSource = function (dirPath, arrayOfFiles) {
  if (fs.existsSync(dirPath)) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
      if (fs.statSync(dirPath + '/' + file).isDirectory()) {
        for (let key of fs.readdirSync(dirPath + '/' + file)) {
          if (key.includes('SourceCode')) {
            arrayOfFiles = getAllFilesWithSource(dirPath + '/' + file, arrayOfFiles)
          }
        }
      } else {
        arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
      }
    })

    return arrayOfFiles
  } else {
    console.log('Dir does not exist')
  }
}

// ** Returns array of files with source code.
const getAllSourceFilesTSX = arr => {
  const files = []

  arr.map(file => {
    if (file.endsWith('SourceCode.tsx') && !files.includes(file)) {
      files.push(file)
    }
  })

  return files
}

// ** Returns array of files with source code if javascript-version directory exists.
const getAllSourceFilesJSX = arr => {
  const files = []

  if (doesJSXVersionExits) {
    arr.map(file => {
      if (file.endsWith('SourceCode.js') && !files.includes(file)) {
        files.push(file)
      }
    })
  } else {
    return
  }

  return files
}

// ** Returns array of index files.
const getAllIndexFiles = (dirPath, arrayOfFiles) => {
  if (fs.existsSync(dirPath)) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
      if (fs.statSync(dirPath + '/' + file).isDirectory()) {
        for (let key of fs.readdirSync(dirPath + '/' + file)) {
          if (key.includes('index')) {
            arrayOfFiles = getAllIndexFiles(dirPath + '/' + file, arrayOfFiles)
          }
        }
      } else {
        arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
      }
    })
    return arrayOfFiles
  } else {
    console.log('Dir does not exist')
  }
}


// ** Replaces code with null based on dir & version.
const replaceCodeWithNull = (dir, version) => {
  dir.map(file => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err)

        return
      } else {
        let result = data
        
        if(version === 'tsx'){
          result = data.replace(new RegExp(/tsx:.*/, 'g'), `tsx: null,`)
        }else if (version === 'jsx'){
          result = data.replace(new RegExp(/jsx:.*/, 'g'), `jsx: null,`)
        }else{
          return 
        }
        
        fs.writeFile(file, result, err => {
          if(err){
            console.log(err);
          }
        })
        
      }
    })
  })
}


const componentFilesTSX = getAllFilesWithSource(componentsPathTSX)
const formsFilesTSX = getAllFilesWithSource(formsPathTSX)
const componentFilesJSX = getAllFilesWithSource(componentsPathJSX) || []
const formsFilesJSX = getAllFilesWithSource(formsPathJSX) || []

const AllFilesTSX = [...componentFilesTSX, ...formsFilesTSX]
const AllFilesJSX = [...componentFilesJSX, ...formsFilesJSX]
const sourceFilesTSX = getAllSourceFilesTSX(AllFilesTSX)
const sourceFilesJSX = getAllSourceFilesJSX(AllFilesJSX) || []

module.exports = {
  AllFilesTSX,
  AllFilesJSX,
  formsPathTSX,
  formsPathJSX,
  sourceFilesTSX,
  sourceFilesJSX,
  getAllIndexFiles,
  componentsPathTSX,
  componentsPathJSX,
  replaceCodeWithNull,
  doesJSXVersionExits,
  getAllSourceFilesTSX,
  getAllSourceFilesJSX,
  getAllFilesWithSource
}
