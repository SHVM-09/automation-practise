const fs = require('fs')
const pathConfig = require('../../configs/paths.json')

// ** Replace basePath if docs directory exists
if (fs.existsSync(`${pathConfig.docsPath}`)) {
  const configFileData = fs
    .readFileSync(`${pathConfig.docsPath}/.vuepress/config.js`)
    .toString()
    .split('\n')
  const baseIndex = configFileData.findIndex(l => l.includes('base:'))
  const demoIndex = configFileData.findIndex(l => l.includes("text: 'Demo'"))
  const purchaseIndex = configFileData.findIndex(l =>
    l.includes("text: 'Purchase'")
  )
  configFileData[baseIndex] = `  base: '/marketplace${pathConfig.docsURL}/',`
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
