
const fs = require('fs')
const { filesToRemove } = require('./helpers')

// ** Delete Files
const deleteFiles = () => {
   filesToRemove.forEach(file => {
       if(fs.existsSync(file)){
        fs.unlink(file, err => {
            if(err){
                console.log(err);

                return
            }
        })
    } 
   })
}

deleteFiles()