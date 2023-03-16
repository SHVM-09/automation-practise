const fs = require('fs')
const pathConfig = require('../../configs/paths.json')
const { themeSelectionGTMConfig, pixinventGTMConfig } = require('../../configs/gtmConfigs')

const docsArgs = process.argv.slice(2)

let GTMHead = themeSelectionGTMConfig.docs.head
let GTMBody = themeSelectionGTMConfig.docs.body

if (docsArgs[0] !== undefined && docsArgs.includes('pixinvent')) {
  GTMHead = pixinventGTMConfig.docs.head
  GTMBody = pixinventGTMConfig.docs.body
}

// ** Reset replaced basePath if docs directory exists
if (fs.existsSync(pathConfig.docsPath)) {
  const fileData = fs
    .readFileSync(`${pathConfig.docsPath}/.vuepress/config.js`)
    .toString()
    .split('\n')
  const index = fileData.findIndex(l => l.includes('base:'))
  fileData[index] = `  base: process.env.BASE || '/',`
  fs.writeFile(
    `${pathConfig.docsPath}/.vuepress/config.js`,
    fileData.join('\n').replace('./favicon.ico', '/favicon.ico'),
    fileData.join('\n').replace('./favicon.png', '/favicon.png'),
    err => {
      if (err) {
        console.log(err)
      }
    }
  )
}
  
// ** Reset ssr.html file if it exists
if (fs.existsSync(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`)) {
  fs.readFile(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      const replaced = data
        .replace(GTMHead, '')
        .replace(GTMBody, '')
        .replace('<head>\n', '<head>')
        .replace('<body>\n', '<body>')

      fs.writeFile(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`, '', err => {
        if (err) {
          console.log(err)
        } else {
          fs.writeFile(`${pathConfig.docsPath}/.vuepress/theme/templates/ssr.html`, replaced, err => {
            if (err) {
              console.log(err)
            }
          })
        }
      })
    }
  })
}
