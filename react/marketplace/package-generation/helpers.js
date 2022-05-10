const pathConfig = require('../../configs/paths.json')

const userLayoutPathTSX = `${pathConfig.packagePath}/typescript-version/full-version/src/layouts/UserLayout.tsx`
const PackageJSONPathTSX = `${pathConfig.packagePath}/typescript-version/full-version/package.json`
const PackageJSONPathJSX = `${pathConfig.packagePath}/javascript-version/full-version/package.json`
const BuyNowComponentPathTSX = `${pathConfig.packagePath}/typescript-version/full-version/src/layouts/components/BuyNowButton.tsx`
const userLayoutPathJSX = `${pathConfig.packagePath}/javascript-version/full-version/src/layouts/UserLayout.js`
const BuyNowComponentPathJSX = `${pathConfig.packagePath}/javascript-version/full-version/src/layouts/components/BuyNowButton.js`

const filesToCopyTSX = [
  `${pathConfig.demoConfigsPathTSX}`,
  `${pathConfig.fullVersionTSXPath}/public`,
  `${pathConfig.fullVersionTSXPath}/src`,
  `${pathConfig.fullVersionTSXPath}/styles`,
  `${pathConfig.fullVersionTSXPath}/.editorconfig`,
  `${pathConfig.fullVersionTSXPath}/.env`,
  `${pathConfig.fullVersionTSXPath}/.eslintrc.json`,
  `${pathConfig.fullVersionTSXPath}/.gitignore`,
  `${pathConfig.fullVersionTSXPath}/.prettierrc.js`,
  `${pathConfig.fullVersionTSXPath}/declaration.d.ts`,
  `${pathConfig.fullVersionTSXPath}/next-env.d.ts`,
  `${pathConfig.fullVersionTSXPath}/next.config.js`,
  `${pathConfig.fullVersionTSXPath}/next.d.ts`,
  `${pathConfig.fullVersionTSXPath}/yarn.lock`,
  `${pathConfig.fullVersionTSXPath}/package.json`,
  `${pathConfig.fullVersionTSXPath}/tsconfig.json`,
  `${pathConfig.fullVersionTSXPath}/package-lock.json`
]

const filesToCopyJSX = [
  `${pathConfig.demoConfigsPathJSX}`,
  `${pathConfig.fullVersionJSXPath}/public`,
  `${pathConfig.fullVersionJSXPath}/src`,
  `${pathConfig.fullVersionJSXPath}/styles`,
  `${pathConfig.fullVersionJSXPath}/.editorconfig`,
  `${pathConfig.fullVersionJSXPath}/.env`,
  `${pathConfig.fullVersionJSXPath}/.eslintrc.js`,
  `${pathConfig.fullVersionJSXPath}/.gitignore`,
  `${pathConfig.fullVersionJSXPath}/.prettierrc.js`,
  `${pathConfig.fullVersionJSXPath}/next.config.js`,
  `${pathConfig.fullVersionJSXPath}/package.json`,
  `${pathConfig.fullVersionJSXPath}/yarn.lock`,
  `${pathConfig.fullVersionJSXPath}/jsconfig.json`,
  `${pathConfig.fullVersionJSXPath}/package-lock.json`
]

const dataToReplace = [
  // HTML
  {
    file: `${pathConfig.packageTSXPath.replace(
      'typescript-version/full-version',
      ''
    )}/documentation.html`,
    replacements: [
      {
        from: new RegExp('https://demos.themeselection.com', 'g'),
        to: 'https://demos.themeselection.com/marketplace'
      }
    ]
  },

  // TSX
  {
    file: `${pathConfig.packageTSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.tsx`,
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
    file: `${pathConfig.packageTSXPath}/src/@fake-db/server-side-menu/horizontal.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.packageTSXPath}/src/@fake-db/server-side-menu/vertical.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.packageTSXPath}/src/layouts/components/BuyNowButton.tsx`,
    replacements: [
      {
        from: new RegExp(/[\s]*?href.*$/),
        to: `https://mui.com/store/items${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `${pathConfig.packageTSXPath}/src/navigation/horizontal/index.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.packageTSXPath}/src/navigation/vertical/index.ts`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },

  // JSX
  {
    file: `${pathConfig.packageJSXPath}/src/@core/layouts/components/shared-components/footer/FooterContent.js`,
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
    file: `${pathConfig.packageJSXPath}/src/@fake-db/server-side-menu/horizontal.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.packageJSXPath}/src/@fake-db/server-side-menu/vertical.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.packageJSXPath}/src/layouts/components/BuyNowButton.js`,
    replacements: [
      {
        from: new RegExp(/[\s]*?href.*$/),
        to: `https://mui.com/store/items${pathConfig.demoURL}`
      }
    ]
  },
  {
    file: `${pathConfig.packageJSXPath}/src/navigation/horizontal/index.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },
  {
    file: `${pathConfig.packageJSXPath}/src/navigation/vertical/index.js`,
    replacements: [
      {
        from: `https://demos.themeselection.com${pathConfig.demoURL}/documentation`,
        to: `https://demos.themeselection.com/marketplace${pathConfig.demoURL}/documentation`
      }
    ]
  },

  // StarterKit
  {
    file: `${pathConfig.packageTSXPath.replace(
      'full-version',
      'starter-kit'
    )}/src/@core/layouts/components/shared-components/footer/FooterContent.tsx`,
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
    file: `${pathConfig.packageJSXPath.replace(
      'full-version',
      'starter-kit'
    )}/src/@core/layouts/components/shared-components/footer/FooterContent.js`,
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
  }
]

module.exports = {
  dataToReplace,
  filesToCopyTSX,
  filesToCopyJSX,
  userLayoutPathJSX,
  userLayoutPathTSX,
  PackageJSONPathTSX,
  PackageJSONPathJSX,
  BuyNowComponentPathTSX,
  BuyNowComponentPathJSX
}
