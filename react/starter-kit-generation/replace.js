const fs = require('fs')
const pathConfig = require('../configs/paths.json')
const { dataToReplace,filesToReplace, BuyNowComponentPathJSX, BuyNowComponentPathTSX } = require('./helpers')

// ** Replace Content in files
const replaceFileContent = () => {
    dataToReplace.forEach(obj => {
        if (fs.existsSync(obj.file)) {
            fs.readFile(obj.file, 'utf-8', (err, data) => {
                if (err) {
                    console.log(err);

                    return
                } else {
                    let result = data
                    obj.replacements.forEach(rep => {
                        result = result.replace(rep.from, rep.to)
                    })
                    fs.writeFile(obj.file, '', err => {
                        if (err) {
                            console.log(err);

                            return
                        }else{

                            fs.writeFile(obj.file, result, (err) => {
                                if (err) {
                                    console.log(err);
        
                                    return
                                }
                            })
                        } 
                    })
                }

            })
        }
    })

    
}

// ** Replaces whole files
const replaceFiles = () => {
  filesToReplace.map(file => {
    if (fs.existsSync(file.src)) {
      fs.copyFile(file.src, file.dest, err => {
        if (err) {
          console.log
        }
      })
    }
  })
}

// ** Delete Files
const deleteFiles = () => {
      // ** Delete BuyNow Component in TSX
    if(fs.existsSync(BuyNowComponentPathTSX)){
        fs.unlink(BuyNowComponentPathTSX, err => {
            if(err){
                console.log(err);

                return
            }
        })
    } 
    // ** Delete BuyNow Component in JSX      
    if(fs.existsSync(BuyNowComponentPathJSX)){
        fs.unlink(BuyNowComponentPathJSX, err => {
            if(err){
                console.log(err);

                return
            }
        })
    }       

    // ** Delete ACL Config in TSX
    if(fs.existsSync(`${pathConfig.starterKitTSXPath}/src/configs/acl.ts`)){
        fs.unlink(`${pathConfig.starterKitTSXPath}/src/configs/acl.ts`, err => {
            if(err){
                console.log(err);

                return
            }
        })
    }

    // ** Delete ACL Config in JSX
    if(fs.existsSync(`${pathConfig.starterKitJSXPath}/src/configs/acl.js`)){
        fs.unlink(`${pathConfig.starterKitJSXPath}/src/configs/acl.js`, err => {
            if(err){
                console.log(err);

                return
            }
        })
    }
}

replaceFiles()
replaceFileContent()
deleteFiles()