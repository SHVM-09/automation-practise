const fs = require('fs')
const path = require('path')

const pathConfig = require('../../configs/paths.json')
const {
  AllFilesJSX,
  doesJSXVersionExits,
  sourceFilesJSX,
  replaceCodeWithNull,
  getAllIndexFiles
} = require('./helpers')

const componentsPath = `${pathConfig.fullVersionJSXPath}/src/pages/components/`
const formsPath = `${pathConfig.fullVersionJSXPath}/src/pages/forms/form-elements/`

// const AllIndexFiles = [...getAllIndexFiles(componentsPath), ...getAllIndexFiles(formsPath)]

// ** Generates JSX source code if javascript-version directory exists
const generateJSXSourceCode = () => {
  if (doesJSXVersionExits) {
    const AllIndexFiles = [
      ...getAllIndexFiles(componentsPath),
      ...getAllIndexFiles(formsPath)
    ]

    const writeCodePromise = AllFilesJSX.map(fileJSX => {
      return new Promise(resolve => {
        if (
          !fileJSX.endsWith('SourceCode.js') &&
          !fileJSX.endsWith('index.js') &&
          !fileJSX.endsWith('data.js') &&
          !fileJSX.endsWith('DS_Store')
        ) {
          const parentFolderJSX = path.basename(path.dirname(fileJSX))
          const fileNameJSX = path.basename(fileJSX, '.js')
          const sourceToReadJSX = sourceFilesJSX.filter(j =>
            j.includes(parentFolderJSX)
          )[0]

          if (fileJSX && sourceToReadJSX) {
            fs.readFile(fileJSX, 'utf8', (err, dataJSX) => {
              fs.readFile(sourceToReadJSX, 'utf8', (err, source) => {
                const code =
                  'export const ' +
                  fileNameJSX +
                  'JSXCode = (' +
                  "<pre className='language-jsx'>" +
                  "<code className='language-jsx'>" +
                  '{`' +
                  dataJSX
                    .replace(/`/g, '')
                    .replace(/\$/g, '')
                    .replace(/\\"/, '"')
                    .replace(/\\"/, '"') +
                  '`}' +
                  '</code>' +
                  '</pre>' +
                  ') \n\n'
                fs.writeFile(sourceToReadJSX, '', err => {
                  if (err) {
                    console.log(err)
                  }
                  fs.appendFile(sourceToReadJSX, code, err => {
                    if (err) {
                      console.log(err)
                    }
                  })
                })
              })
            })
          }
        }
        resolve()
      })
    })

    Promise.all(writeCodePromise).then(() => {
      // ** Replace tsx code with null to hide it.
      replaceCodeWithNull(AllIndexFiles, 'tsx')
    })
  } else {
    console.log('Javascript version does not exist')
  }
}

generateJSXSourceCode()

module.exports = {
  generateJSXSourceCode
}
