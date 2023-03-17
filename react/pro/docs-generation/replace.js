const fs = require('fs')
const pathConfig = require('../../configs/paths.json')
const { themeSelectionGTMConfig, pixinventGTMConfig } = require('../../configs/gtmConfigs')

let URL = pathConfig.docsURL

const docsArgs = process.argv.slice(2)

let GTMHead = themeSelectionGTMConfig.docs.head
let GTMBody = themeSelectionGTMConfig.docs.body

if (docsArgs[0] !== undefined && docsArgs.includes('staging')) {
  if(!docsArgs.includes('pixinvent')){
    URL = pathConfig.stagingDocsURL
  }else{
    URL = pathConfig.stagingDocsURL
  }
}

if (docsArgs[0] !== undefined && docsArgs.includes('pixinvent')) {
  GTMHead = pixinventGTMConfig.docs.head
  GTMBody = pixinventGTMConfig.docs.body

  if(!docsArgs.includes('staging')){
    URL = pathConfig.docsURL
  }else{
    URL = pathConfig.stagingDocsURL
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

// ** Add GTM in ssr.html file if it exists
if (fs.existsSync(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`)) {
  fs.readFile(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      fs.writeFile(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`, '', err => {
        if (err) {
          console.log(err)

          return
        } else {
          fs.writeFile(
            `${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`,
            data.replace('<head>', `<head>\n${GTMHead}`).replace('<body>', `<body>\n${GTMBody}`),
            err => {
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
