const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')

const demoConfigPath = `../${pathConfig.demoConfigsPathTSX}/demo-1.ts`
const i18nPath = `../${pathConfig.fullVersionTSXPath}/src/configs/i18n.ts`
const nextConfigPath = `../${pathConfig.fullVersionTSXPath}/next.config.js`
const themeConfigPath = `../${pathConfig.fullVersionTSXPath}/src/configs/themeConfig.ts`
const settingsContextFile = `../${pathConfig.fullVersionTSXPath}/src/@core/context/settingsContext.tsx`

const copyDirectory = (source, destination) => {
  fs.mkdirSync(destination, {
    recursive: true
  })

  fs.readdirSync(source, {
    withFileTypes: true
  }).forEach(entry => {
    let sourcePath = path.join(source, entry.name)
    let destinationPath = path.join(destination, entry.name)

    entry.isDirectory()
      ? copyDirectory(sourcePath, destinationPath)
      : fs.copyFileSync(sourcePath, destinationPath)
  })
}

const testFoldersToModify = [
  {
    from: `../${pathConfig.fullVersionTSXPath}/src/views/components/test`,
    to: `./temp-folder/${pathConfig.fullVersionTSXPath.replace(
      '../../../',
      ''
    )}/src/views/components/test`
  },
  {
    from: `../${pathConfig.fullVersionTSXPath}/src/pages/components/test`,
    to: `./temp-folder/${pathConfig.fullVersionTSXPath.replace(
      '../../../',
      ''
    )}/src/pages/components/test`
  },
  {
    from: `../${pathConfig.fullVersionTSXPath}/src/views/forms/form-elements/test`,
    to: `./temp-folder/${pathConfig.fullVersionTSXPath.replace(
      '../../../',
      ''
    )}/src/views/forms/form-elements/test`
  },
  {
    from: `../${pathConfig.fullVersionTSXPath}/src/pages/forms/form-elements/test`,
    to: `./temp-folder/${pathConfig.fullVersionTSXPath.replace(
      '../../../',
      ''
    )}/src/pages/forms/form-elements/test`
  },

  {
    from: `../${pathConfig.fullVersionJSXPath}/src/views/components/test`,
    to: `./temp-folder/${pathConfig.fullVersionJSXPath.replace(
      '../../../',
      ''
    )}/src/views/components/test`
  },
  {
    from: `../${pathConfig.fullVersionJSXPath}/src/pages/components/test`,
    to: `./temp-folder/${pathConfig.fullVersionJSXPath.replace(
      '../../../',
      ''
    )}/src/pages/components/test`
  },
  {
    from: `../${pathConfig.fullVersionJSXPath}/src/views/forms/form-elements/test`,
    to: `./temp-folder/${pathConfig.fullVersionJSXPath.replace(
      '../../../',
      ''
    )}/src/views/forms/form-elements/test`
  },
  {
    from: `../${pathConfig.fullVersionJSXPath}/src/pages/forms/form-elements/test`,
    to: `./temp-folder/${pathConfig.fullVersionJSXPath.replace(
      '../../../',
      ''
    )}/src/pages/forms/form-elements/test`
  }
]

const testFoldersToCopy = [
  {
    from: `../${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu`,
    to: `./temp-folder/${pathConfig.fullVersionTSXPath.replace(
      '../../../',
      ''
    )}/src/@fake-db/server-side-menu`
  },
  {
    from: `../${pathConfig.fullVersionTSXPath}/src/navigation`,
    to: `./temp-folder/${pathConfig.fullVersionTSXPath.replace(
      '../../../',
      ''
    )}/src/navigation`
  },
  {
    from: `../${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu`,
    to: `./temp-folder/${pathConfig.fullVersionJSXPath.replace(
      '../../../',
      ''
    )}/src/@fake-db/server-side-menu`
  },
  {
    from: `../${pathConfig.fullVersionJSXPath}/src/navigation`,
    to: `./temp-folder/${pathConfig.fullVersionJSXPath.replace(
      '../../../',
      ''
    )}/src/navigation`
  }
]

const dataToReplace = [
  {
    file: `../${pathConfig.fullVersionTSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.tsx`,
    replacements: [
      {
        from: new RegExp("'https://themeselection.com/'", 'g'),
        to: "'https://mui.com/store/contributiors/themeselection/'"
      },
      {
        from: new RegExp('https://themeselection.com/license', 'g'),
        to: 'https://mui.com/store/license'
      },
      {
        from: new RegExp(
          `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
          'g'
        ),
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/horizontal.ts`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionTSXPath}/src/layouts/components/BuyNowButton.tsx`,
    replacements: [
      {
        from: new RegExp(/[\s]*?href.*$/),
        to: `https://mui.com/store/items${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionTSXPath}/src/navigation/horizontal/index.ts`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionTSXPath}/src/navigation/vertical/index.ts`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionJSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.js`,
    replacements: [
      {
        from: new RegExp("'https://themeselection.com/'", 'g'),
        to: "'https://mui.com/store/contributiors/themeselection/'"
      },
      {
        from: new RegExp('https://themeselection.com/license', 'g'),
        to: 'https://mui.com/store/license'
      },
      {
        from: new RegExp(
          `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
          'g'
        ),
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/horizontal.js`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/vertical.js`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionJSXPath}/src/layouts/components/BuyNowButton.js`,
    replacements: [
      {
        from: new RegExp(/[\s]*?href.*$/),
        to: `https://mui.com/store/items${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionJSXPath}/src/navigation/horizontal/index.js`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `../${pathConfig.fullVersionJSXPath}/src/navigation/vertical/index.js`,
    replacements: [
      {
        from: 'https://themeselection.com/docs/',
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  }
]

const filesWithTestObj = [
  `../${pathConfig.fullVersionTSXPath}/src/navigation/vertical/index.ts`,
  `../${pathConfig.fullVersionTSXPath}/src/navigation/horizontal/index.ts`,
  `../${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
  `../${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/horizontal.ts`,
  `../${pathConfig.fullVersionJSXPath}/src/navigation/vertical/index.ts`,
  `../${pathConfig.fullVersionJSXPath}/src/navigation/horizontal/index.ts`,
  `../${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
  `../${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/horizontal.ts`
]

module.exports = {
  i18nPath,
  dataToReplace,
  copyDirectory,
  demoConfigPath,
  nextConfigPath,
  themeConfigPath,
  filesWithTestObj,
  testFoldersToCopy,
  settingsContextFile,
  testFoldersToModify
}
