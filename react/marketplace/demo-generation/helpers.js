const pathConfig = require('../../configs/paths.json')

const demoConfigPath = `${pathConfig.demoConfigsPathTSX}/demo-1.ts`
const i18nPath = `${pathConfig.fullVersionTSXPath}/src/configs/i18n.ts`
const nextConfigPath = `${pathConfig.fullVersionTSXPath}/next.config.js`
const themeConfigPath = `${pathConfig.fullVersionTSXPath}/src/configs/themeConfig.ts`
const settingsContextFile = `${pathConfig.fullVersionTSXPath}/src/@core/context/settingsContext.tsx`



const dataToReplace = [
  {
    file: `${pathConfig.fullVersionTSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.tsx`,
    replacements: [
      {
        from: new RegExp("'https://themeselection.com/'", 'g'),
        to: "'https://mui.com/store/contributors/themeselection/'"
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
    file: `${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/horizontal.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/layouts/components/BuyNowButton.tsx`,
    replacements: [
      {
        from: `https://themeselection.com/products${pathConfig.demoURL}`,
        to: `https://mui.com/store/items${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/navigation/horizontal/index.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/navigation/vertical/index.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.js`,
    replacements: [
      {
        from: new RegExp("'https://themeselection.com/'", 'g'),
        to: "'https://mui.com/store/contributors/themeselection/'"
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
    file: `${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/horizontal.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/vertical.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/layouts/components/BuyNowButton.js`,
    replacements: [
      {
        from: `https://themeselection.com/products${pathConfig.demoURL}`,
        to: `https://mui.com/store/items${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/navigation/horizontal/index.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/navigation/vertical/index.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  }
]

const dataToReset = [
  {
    file: `${pathConfig.fullVersionTSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.tsx`,
    replacements: [
      {
        from: new RegExp(
          "'https://mui.com/store/contributors/themeselection/'",
          'g'
        ),
        to: "'https://themeselection.com/'"
      },
      {
        from: new RegExp('https://mui.com/store/license', 'g'),
        to: 'https://themeselection.com/license'
      },
      {
        from: new RegExp(
          `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
          'g'
        ),
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/horizontal.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/layouts/components/BuyNowButton.tsx`,
    replacements: [
      {
        from: `https://mui.com/store/items${pathConfig.demoURL}`,
        to: `https://themeselection.com/products${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/navigation/horizontal/index.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionTSXPath}/src/navigation/vertical/index.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.js`,
    replacements: [
      {
        from: new RegExp(
          "'https://mui.com/store/contributors/themeselection/'",
          'g'
        ),
        to: "'https://themeselection.com/'"
      },
      {
        from: new RegExp('https://mui.com/store/license', 'g'),
        to: 'https://themeselection.com/license'
      },
      {
        from: new RegExp(
          `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
          'g'
        ),
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/horizontal.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/@fake-db/server-side-menu/vertical.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/layouts/components/BuyNowButton.js`,
    replacements: [
      {
        from: `https://mui.com/store/items${pathConfig.demoURL}`,
        to: `https://themeselection.com/products${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/navigation/horizontal/index.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.fullVersionJSXPath}/src/navigation/vertical/index.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`
      }
    ]
  }
]



const templateName = pathConfig.fullVersionTSXPath
  .split('../')
  .filter(i => i.length)[0]
  .split('/')[0]
  .split('-')[0]

module.exports = {
  i18nPath,
  dataToReset,
  templateName,
  dataToReplace,
  demoConfigPath,
  nextConfigPath,
  themeConfigPath,
  settingsContextFile
}
