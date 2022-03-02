const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')

const copyDirectory = (source, destination) => {
    fs.mkdirSync(destination, {
        recursive: true
    })

    fs.readdirSync(source, {
        withFileTypes: true
    }).forEach((entry) => {
        let sourcePath = path.join(source, entry.name);
        let destinationPath = path.join(destination, entry.name);

        entry.isDirectory() ?
            copyDirectory(sourcePath, destinationPath) :
            fs.copyFileSync(sourcePath, destinationPath);
    });
}

const testFoldersToModify = [
    {
        from: `${pathConfig.packageTSXPath}/src/views/components/test`,
        to: `./temp-folder/${pathConfig.packageTSXPath}/src/views/components/test`,
    },
    {
        from: `${pathConfig.packageTSXPath}/src/pages/components/test`,
        to: `./temp-folder/${pathConfig.packageTSXPath}/src/pages/components/test`,
    },
    {
        from: `${pathConfig.packageTSXPath}/src/views/forms/form-elements/test`,
        to: `./temp-folder/${pathConfig.packageTSXPath}/src/views/forms/form-elements/test`,
    },
    {
        from: `${pathConfig.packageTSXPath}/src/pages/forms/form-elements/test`,
        to: `./temp-folder/${pathConfig.packageTSXPath}/src/pages/forms/form-elements/test`,
    },
     {
        from: `${pathConfig.packageJSXPath}/src/views/components/test`,
        to: `./temp-folder/${pathConfig.packageJSXPath}/src/views/components/test`,
    },
    {
        from: `${pathConfig.packageJSXPath}/src/pages/components/test`,
        to: `./temp-folder/${pathConfig.packageJSXPath}/src/pages/components/test`,
    },
    {
        from: `${pathConfig.packageJSXPath}/src/views/forms/form-elements/test`,
        to: `./temp-folder/${pathConfig.packageJSXPath}/src/views/forms/form-elements/test`,
    },
    {
        from: `${pathConfig.packageJSXPath}/src/pages/forms/form-elements/test`,
        to: `./temp-folder/${pathConfig.packageJSXPath}/src/pages/forms/form-elements/test`,
    },
]

const testFoldersToCopy = [
    {
        from: `${pathConfig.packageTSXPath}/src/@fake-db/server-side-menu`,
        to: `./temp-folder/${pathConfig.packageTSXPath}/src/@fake-db/server-side-menu`,
    },
    {
        from: `${pathConfig.packageTSXPath}/src/navigation`,
        to: `./temp-folder/${pathConfig.packageTSXPath}/src/navigation`,
    },
    {
        from: `${pathConfig.packageJSXPath}/src/@fake-db/server-side-menu`,
        to: `./temp-folder/${pathConfig.packageJSXPath}/src/@fake-db/server-side-menu`,
    },
    {
        from: `${pathConfig.packageJSXPath}/src/navigation`,
        to: `./temp-folder/${pathConfig.packageJSXPath}/src/navigation`,
    },

]

const filesWithTestObj = [
    `${pathConfig.packageTSXPath}/src/navigation/vertical/index.ts`,
    `${pathConfig.packageTSXPath}/src/navigation/horizontal/index.ts`,
    `${pathConfig.packageTSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
    `${pathConfig.packageTSXPath}/src/@fake-db/server-side-menu/horizontal.ts`,
    `${pathConfig.packageJSXPath}/src/navigation/vertical/index.js`,
    `${pathConfig.packageJSXPath}/src/navigation/horizontal/index.js`,
    `${pathConfig.packageJSXPath}/src/@fake-db/server-side-menu/vertical.js`,
    `${pathConfig.packageJSXPath}/src/@fake-db/server-side-menu/horizontal.js`,
]



const removeTest = () => {
  const removePromise = testFoldersToModify.map(folder => {
      if (fs.existsSync(folder.from)) {
        fs.rmSync(folder.from, {
          recursive: true
        })
      }
    })

  Promise.all(removePromise).then(() => {
    filesWithTestObj.map(file => {
      if (fs.existsSync(file)) {
        fs.readFile(file, 'utf-8', (err, data) => {
          if (err) {
            console.log(err);
          } else {
            if(data.includes("title: 'Test'")){
              const updatedData = data
                .replace(/title: 'Test',/g, '')
                .replace("path: '/components/test'", '')
                .replace("path: '/forms/form-elements/test'", '')
                .replace(/[\s]*?{[\s]*?[\s]*?}/g, '')
              fs.writeFile(file, '', err => {
                if (err) {
                  console.log(err);
                }
                fs.writeFile(file, updatedData, err => {
                  if (err) {
                    console.log(err);
                  }
                })
              })
            }
          }
        })
      }
    })
  })
//   .then(() => {
//     // testFoldersToCopy.map(folder => {
//     //   if (fs.existsSync(folder.from)) {
//     //     copyDirectory(folder.from, folder.to)
//     //   }
//     // })

//   }).then(() => {
//     resetTestFolders()
//   })
}

removeTest()