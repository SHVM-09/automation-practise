const fs = require('fs')

const themeConfigFilePath = '../../vue/typescript-version/full-version/themeConfig.ts'
const configs = require('./configs.json')
const demoArgs = process.argv.slice(2)

fs.readFile(themeConfigFilePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  const demoName = demoArgs[0]
  let result = data

  configs[demoName].forEach((elements) => {
    result = result.replace(elements.replace.toString(), elements.match.toString());    
  })

  fs.writeFile(themeConfigFilePath, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
})