const fs = require('fs')
const pathConfig = require('../configs/paths.json')

// ** Reset replaced basePath if docs directory exists
if(fs.existsSync(pathConfig.docsPath)){
    const fileData = fs.readFileSync(`${pathConfig.docsPath}/.vuepress/config.js`).toString().split('\n')
    const index = fileData.findIndex(l => l.includes('base:'))
    fileData[index] = `  base: '/',`
    fs.writeFile(`${pathConfig.docsPath}/.vuepress/config.js`,  fileData.join('\n'), err => {
        if(err){
            console.log(err);
        }
    })
}