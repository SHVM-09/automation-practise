const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')

const bundleFilePath = `${pathConfig.fullVersionJSXPath}/src/iconify-bundle/bundle-icons-react.js`

if (fs.existsSync(bundleFilePath)) {
  fs.readFile(bundleFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      const splitData = data.split('\n')

      const updated = splitData
        .map((line, index) => {
          if (line.includes('import {') && !line.includes('addCollection')) {
            line = line.replace('import {', 'const {')
          }

          if (line.includes(`} from '`) && !line.includes('addCollection')) {
            line = line.replace(`} from '`, `} = require('`).replace(';', '').concat(')')
          }

          if (line.includes('/* {')) {
            line = `{`
          }

          if (line.includes('svg: [')) {
            line = `${line} \n /*`
          }

          return line
        })
        .join('\n')

      fs.writeFile(bundleFilePath, '', err => {
        if (err) {
          console.log(err)
        } else {
          fs.writeFile(bundleFilePath, updated.replace('promises as fs', 'promises: fs'), err => {
            if (err) {
              console.log(err)
            }
          })
        }
      })
    }
  })
}
