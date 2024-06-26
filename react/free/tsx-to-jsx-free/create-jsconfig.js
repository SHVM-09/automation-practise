const fs = require('fs')
const pathConfig = require('../../configs/paths.json')

const jsConfigPath = `${pathConfig.basePathJSX}/jsconfig.json`

const jsConfig = {
  compilerOptions: {
    baseUrl: '.'
  },
  include: ['src']
}

// ** Write jsconfig.json in javascript-version dir
fs.writeFile(jsConfigPath, JSON.stringify(jsConfig), err => {
  if (err) {
    console.error(err)

    return
  } else {
    console.log('File Written: JSCONFIG!!!!!!!')
  }
})
