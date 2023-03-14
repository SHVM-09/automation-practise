const fs = require('fs')
const pathConfig = require('../../configs/paths.json')
const { themeSelectionGTMConfig } = require('../../configs/gtmConfigs')

let URL = pathConfig.docsURL

const docsArgs = process.argv.slice(2)

let GTMHead = themeSelectionGTMConfig.docs.head
let GTMBody = themeSelectionGTMConfig.docs.body

if (docsArgs[0] !== undefined && docsArgs.includes('staging')) {
  URL = pathConfig.stagingDocsURL
}

// ** Replace basePath if docs directory exists
if (fs.existsSync(pathConfig.docsPath)) {
  const configFileData = fs
    .readFileSync(`${pathConfig.docsPath}/.vuepress/config.js`)
    .toString()
    .split('\n')
  const baseIndex = configFileData.findIndex(l => l.includes('base:'))
  const demoIndex = configFileData.findIndex(l => l.includes("text: 'Demo'"))
  const purchaseIndex = configFileData.findIndex(l =>
    l.includes("text: 'Purchase'")
  )
  configFileData[baseIndex] = `  base: '/marketplace${URL}/',`
  configFileData[
    demoIndex
  ] = `      { text: 'Demo', link: 'https://demos.themeselection.com/marketplace${pathConfig.demoURL}/landing-page/' },`
  configFileData[
    purchaseIndex
  ] = `      { text: 'Purchase', link: 'https://mui.com/store/items${pathConfig.demoURL}/' },`
  fs.writeFile(
    `${pathConfig.docsPath}/.vuepress/config.js`,
    configFileData.join('\n').replace('/favicon.ico', './favicon.ico'),
    err => {
      if (err) {
        console.log(err)
      }
    }
  )

  if (fs.existsSync(`${pathConfig.docsPath}/.vuepress/styles/index.styl`)) {
    fs.readFile(
      `${pathConfig.docsPath}/.vuepress/styles/index.styl`,
      'utf-8',
      (err, data) => {
        if (err) {
          console.log(err)
        } else {
          const result = data.replace(
            `https://themeselection.com/products${pathConfig.demoURL}`,
            `https://mui.com/store/items${pathConfig.demoURL}`
          )

          fs.writeFile(
            `${pathConfig.docsPath}/.vuepress/styles/index.styl`,
            result,
            err => {
              if (err) {
                console.log(err)
              }
            }
          )
        }
      }
    )
  }

  if (fs.existsSync(`${pathConfig.docsPath}/guide/development/theming.md`)) {
    fs.readFile(
      `${pathConfig.docsPath}/guide/development/theming.md`,
      'utf-8',
      (err, data) => {
        if (err) {
          console.log(err)
        } else {
          const result = data.replace(
            new RegExp('https://demos.themeselection.com/', 'g'),
            'https://demos.themeselection.com/marketplace/'
          )

          fs.writeFile(
            `${pathConfig.docsPath}/guide/development/theming.md`,
            result,
            err => {
              if (err) {
                console.log(err)
              }
            }
          )
        }
      }
    )
  }
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
