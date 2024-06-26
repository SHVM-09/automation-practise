const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')
const {
  AllFilesTSX,
  AllFilesJSX,
  checkEndsWith,
  sourceFilesTSX,
  sourceFilesJSX,
  getAllIndexFiles,
  replaceCodeWithNull,
  doesJSXVersionExits
} = require('./helpers')

const componentsPath = `${pathConfig.fullVersionTSXPath}/src/pages/components/`
const formsPath = `${pathConfig.fullVersionTSXPath}/src/pages/forms/form-elements/`

const AllIndexFiles = [...getAllIndexFiles(componentsPath), ...getAllIndexFiles(formsPath)]

const generateTSXSourceCode = () => {
  return new Promise(resolve => {
    AllFilesTSX.map(fileTSX => {
      if (!checkEndsWith(['data.ts', 'index.tsx', 'types.ts', 'DS_Store', 'SourceCode.tsx'], fileTSX)) {
        const parentFolderTSX = path.basename(path.dirname(fileTSX))
        const fileNameTSX = path.basename(fileTSX, '.tsx')
        const fileJSX = AllFilesJSX.filter(i => i.includes(fileNameTSX))[0]
        const sourceToReadTSX = sourceFilesTSX.filter(t => t.includes(parentFolderTSX))[0]
        const sourceToReadJSX = sourceFilesJSX.filter(t => t.includes(parentFolderTSX))[0]

        if (sourceToReadTSX && fileTSX) {
          fs.readFile(fileTSX, 'utf8', (err, dataTSX) => {
            fs.readFile(sourceToReadTSX, 'utf8', () => {
              const codeTSX =
                'export const ' +
                fileNameTSX +
                'TSXCode = (' +
                "<pre className='language-jsx'>" +
                "<code className='language-jsx'>" +
                '{`' +
                dataTSX.replace(/`/g, '').replace(/\$/g, '').replace(/\\"/, '"').replace(/\\"/, '"') +
                '`}' +
                '</code>' +
                '</pre>' +
                ') \n\n'

              fs.writeFile(sourceToReadTSX, '', err => {
                if (err) {
                  console.log(err)
                }
                fs.appendFile(sourceToReadTSX, codeTSX, err => {
                  if (err) {
                    console.log(err)
                  }
                })
              })
            })
          })

          if (doesJSXVersionExits) {
            if (sourceToReadJSX && fileJSX) {
              fs.readFile(fileJSX, 'utf8', (err, dataJSX) => {
                fs.readFile(sourceToReadJSX, 'utf8', (err, source) => {
                  const codeJSX =
                    'export const ' +
                    fileNameTSX +
                    'JSXCode = (' +
                    "<pre className='language-jsx'>" +
                    "<code className='language-jsx'>" +
                    '{`' +
                    dataJSX.replace(/`/g, '').replace(/\$/g, '').replace(/\\"/, '"').replace(/\\"/, '"') +
                    '`}' +
                    '</code>' +
                    '</pre>' +
                    ') \n\n'
                  if (sourceToReadTSX) {
                    fs.appendFile(sourceToReadTSX, codeJSX, err => {
                      if (err) {
                        console.log(err)
                      }
                    })
                  }
                })
              })
            }
          } else {
            console.log('Javascript version does not exist')
          }
        }
      }

      return
    })

    resolve()
  })
}

generateTSXSourceCode().then(() => {
  if (!doesJSXVersionExits) {
    replaceCodeWithNull(AllIndexFiles, 'jsx')
  } else {
    if (AllIndexFiles.length) {
      AllIndexFiles.map(file => {
        fs.readFile(file, 'utf-8', (err, data) => {
          if (err) {
            console.log(err)
            return
          } else {
            const linesToReplace = []
            let result = data
            const splitData = data.split('\n')

            splitData.forEach((line, index) => {
              if (line.trim().includes('jsx: null')) {
                const replaced = splitData[index - 1]
                  ? splitData[index - 1].replace('tsx: ', '').replace('TSXCode', 'JSXCode').replace(',', '').trim()
                  : null

                linesToReplace.push({
                  line: line.trim(),
                  replacement: replaced ? line.trim().replace('null', replaced) : ''
                })
              }
            })
            linesToReplace.forEach(r => {
              result = result.replace(r.line, r.replacement)
            })

            fs.writeFile(file, result, err => {
              if (err) {
                console.log(err)

                return
              }
            })
          }
        })
      })
    }
  }
})

module.exports = {
  generateTSXSourceCode
}
