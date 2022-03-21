const fs = require('fs')
const { dataToReplace } = require('./helpers')

// ** Replace With MarketPlace URLS
const replaceWithMarketPlace = () => {
  dataToReplace.map(i => {
    if (fs.existsSync(i.file)) {
      fs.readFile(i.file, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          let result = data

          i.replacements.map(rep => {
            result = result.replace(rep.from, rep.to)
          })

          fs.writeFile(i.file, '', err => {
            if (err) {
              console.log(err)
            } else {
              fs.writeFileSync(i.file, result)
            }
          })
        }
      })
    }
  })
}

replaceWithMarketPlace()
