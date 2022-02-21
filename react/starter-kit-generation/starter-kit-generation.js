const fs = require('fs')
const pathConfig = require('../configs/paths.json')

const {
  filesToCopyTSX,
  filesToCopyJSX,
  foldersToKeepTSX,
  foldersToKeepJSX,
  copyRecursiveSync,
  foldersToRemoveTSX,
  foldersToRemoveJSX,
} = require('./helpers')

let arg = null

const passedArgs = process.argv.slice(2)

// ** Updated args var
if (passedArgs[0] !== undefined) {
  arg = passedArgs[0]
} else {
  arg = null
}



// ** Generates second page in src/pages folder
const generateSecondPage = (parentFolder, fileToRead, fileToWrite) => { 
  fs.mkdir(`${parentFolder}/src/pages/second-page`, err => {
    if (err) {
      console.log(err)

      return
    } else {
      fs.writeFile(
        fileToWrite,
        fs.readFileSync(fileToRead).toString(),
        err => {
          if (err) {
            console.log(err)

            return
          }
        }
      )
    }
  })
}

// ** Generates TSX StarterKit
const generateTSXStarter = () => {

  const createStarter = () => fs.mkdir(pathConfig.starterKitTSXPath, err => {
    if (err) {
      console.log(err)

      return
    } else {
      filesToCopyTSX.map(file => {
        
        
        const dest = file.replace('full-version', 'starter-kit')        

        copyRecursiveSync(file, dest)
      })

      foldersToRemoveTSX.map(folder => {
        try{
          fs.rm(folder, { recursive: true, force: true }, err => {
            err ? console.log(err) : null
          })
        }catch{
          console.log(`Error while deleting ${folder}`);
        }
      })
      

      fs.rm(`${pathConfig.starterKitTSXPath}/src/pages`, { recursive: true, force: true }, err => {
        if (err) {
          console.log(err)

          return
        } else {
          fs.mkdir(`${pathConfig.starterKitTSXPath}/src/pages`, err => {
            if (err) {
              console.log(err)

              return
            } else {
              foldersToKeepTSX.map(file => {
                copyRecursiveSync(`${pathConfig.fullVersionTSXPath}/src/${file}`, `${pathConfig.starterKitTSXPath}/src/${file}`)
              })
                           
              generateSecondPage(pathConfig.starterKitTSXPath, './components/tsx/second-page/index.tsx', `${pathConfig.starterKitTSXPath}/src/pages/second-page/index.tsx`)
            }
          })
        }
      })
    }
  })

  if (!fs.existsSync(pathConfig.starterKitTSXPath)) {
    createStarter()

  } else {
    fs.rm(pathConfig.starterKitTSXPath, { recursive: true, force: true }, err => {
      if (err) {
        console.log(err)
      } else {
        createStarter()
      }
    })
  }
}

// ** Generates JSX StarterKit
const generateJSXStarter = () => {

  if(fs.existsSync(pathConfig.basePathJSX)){
    const createStarter = () => fs.mkdir(pathConfig.starterKitJSXPath, err => {
    if (err) {
      console.log(err)

      return
    } else {
      filesToCopyJSX.map(file => {
        const dest = file.replace('full-version', 'starter-kit')

        copyRecursiveSync(file, dest)
      })

      foldersToRemoveJSX.map(folder => {
        try{
          fs.rm(folder, { recursive: true, force: true }, err => {
            err ? console.log(err) : null
          })
        }catch{
          console.log(`Error while deleting ${folder}`);
        }
      })

      fs.rm(`${pathConfig.starterKitJSXPath}/src/pages`, { recursive: true, force: true }, err => {
        if (err) {
          console.log(err)

          return
        } else {
          fs.mkdir(`${pathConfig.starterKitJSXPath}/src/pages`, err => {
            if (err) {
              console.log(err)

              return
            } else {
              foldersToKeepJSX.map(file => {
                copyRecursiveSync(`${pathConfig.fullVersionJSXPath}/src/${file}`, `${pathConfig.starterKitJSXPath}/src/${file}`)
              })
              
             

              generateSecondPage(pathConfig.starterKitJSXPath, './components/jsx/second-page/index.js', `${pathConfig.starterKitJSXPath}/src/pages/second-page/index.js`)
            }
          })
        }
      })
    }
  })

  if (!fs.existsSync(pathConfig.starterKitJSXPath)) {
    createStarter()

  } else {
    fs.rm(pathConfig.starterKitJSXPath, { recursive: true, force: true }, err => {
      if (err) {
        console.log(err)
      } else {
        createStarter()
      }
    })
  }
  }
}

// ** Generates StarterKit based on args
const generate = () => {
  if (arg !== null) {
    if (arg === 'tsx') {
      generateTSXStarter()
    } else {
      generateJSXStarter()
    }
  } else {
    generateTSXStarter()
    generateJSXStarter()
  }
}

generate()