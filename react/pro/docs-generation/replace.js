const fs = require('fs')
const pathConfig = require('../../configs/paths.json')

let URL = pathConfig.docsURL

const demoArgs = process.argv.slice(2)

if (demoArgs[0] !== undefined && demoArgs.includes('staging')) {
  URL = pathConfig.stagingDocsURL
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
