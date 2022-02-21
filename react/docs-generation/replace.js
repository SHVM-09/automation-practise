const fs = require('fs')
const pathConfig = require('../configs/paths.json')

// ** Replace basePath if docs directory exists
if(fs.existsSync(pathConfig.docsPath)){
    const fileData = fs.readFileSync(`${pathConfig.docsPath}/.vuepress/config.js`).toString().split('\n')
    const index = fileData.findIndex(l => l.includes('base:'))
    fileData[index] = `base: '${pathConfig.docsURL}/',`
    fs.writeFile(`${pathConfig.docsPath}/.vuepress/config.js`,  fileData.join('\n'), err => {
        if(err){
            console.log(err);
        }
    })
}