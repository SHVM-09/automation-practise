const fs = require('fs')
const pathConfig = require('../../configs/paths.json')

let URL = pathConfig.docsURL

const docsArgs = process.argv.slice(2)

if (docsArgs[0] !== undefined && docsArgs.includes('staging')) {
  if(!docsArgs.includes('pixinvent')){
    URL = pathConfig.stagingDocsURL
  }else{
    URL = `/demo${pathConfig.stagingDocsURL}`
  }
}

if (docsArgs[0] !== undefined && docsArgs.includes('pixinvent')) {
  if(!docsArgs.includes('staging')){
    URL = `/demo${pathConfig.docsURL}`
  }else{
    URL = `/demo${pathConfig.stagingDocsURL}`
  }
}

// ** Replace basePath if docs directory exists
if (fs.existsSync(pathConfig.docsPath)) {
  const fileData = fs
    .readFileSync(`${pathConfig.docsPath}/.vuepress/config.js`)
    .toString()
    .split('\n')
  const index = fileData.findIndex(l => l.includes('base:'))
  fileData[index] = `  base: '${URL}/',`
  fs.writeFile(
    `${pathConfig.docsPath}/.vuepress/config.js`,
    fileData.join('\n').replace('/favicon.ico', './favicon.ico'),
    err => {
      if (err) {
        console.log(err)
      }
    }
  )
}
