const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')

const AppPathTSX = `${pathConfig.starterKitTSXPath}/src/pages/_app.tsx`
const AppPathJSX = `${pathConfig.starterKitJSXPath}/src/pages/_app.js`
const HomePathJSX = `${pathConfig.starterKitJSXPath}/src/pages/index.js`
const HomePathTSX = `${pathConfig.starterKitTSXPath}/src/pages/index.tsx`
const PackageJSONPathTSX = `${pathConfig.starterKitTSXPath}/package.json`
const PackageJSONPathJSX = `${pathConfig.starterKitJSXPath}/package.json`
const userLayoutPathJSX = `${pathConfig.starterKitJSXPath}/src/layouts/UserLayout.js`
const userLayoutPathTSX = `${pathConfig.starterKitTSXPath}/src/layouts/UserLayout.tsx`
const LoginPathTSX = `${pathConfig.starterKitTSXPath}/src/pages/login/index.tsx`
const LoginPathJSX = `${pathConfig.starterKitJSXPath}/src/pages/login/index.js`
const RegisterPathTSX = `${pathConfig.starterKitTSXPath}/src/pages/register/index.tsx`
const RegisterPathJSX = `${pathConfig.starterKitJSXPath}/src/pages/register/index.js`
const themeConfigPathTSX = `${pathConfig.starterKitTSXPath}/src/configs/themeConfig.ts`
const themeConfigPathJSX = `${pathConfig.starterKitJSXPath}/src/configs/themeConfig.js`
const navigationVerticalPathTSX = `${pathConfig.starterKitTSXPath}/src/navigation/vertical/index.ts`
const navigationVerticalPathJSX = `${pathConfig.starterKitJSXPath}/src/navigation/vertical/index.js`
const TranslationsPathJSX = `${pathConfig.starterKitJSXPath}/src/layouts/components/Translations.js`
const TranslationsPathTSX = `${pathConfig.starterKitTSXPath}/src/layouts/components/Translations.tsx`
const BuyNowComponentPathJSX = `${pathConfig.starterKitJSXPath}/src/layouts/components/BuyNowButton.js`
const BuyNowComponentPathTSX = `${pathConfig.starterKitTSXPath}/src/layouts/components/BuyNowButton.tsx`
const navigationHorizontalPathTSX = `${pathConfig.starterKitTSXPath}/src/navigation/horizontal/index.ts`
const navigationHorizontalPathJSX = `${pathConfig.starterKitJSXPath}/src/navigation/horizontal/index.js`
const appbarVerticalPathTSX = `${pathConfig.starterKitTSXPath}/src/layouts/components/vertical/AppBarContent.tsx`
const appbarVerticalPathJSX = `${pathConfig.starterKitJSXPath}/src/layouts/components/vertical/AppBarContent.js`
const appbarHorizontalPathTSX = `${pathConfig.starterKitTSXPath}/src/layouts/components/horizontal/AppBarContent.tsx`
const appbarHorizontalPathJSX = `${pathConfig.starterKitJSXPath}/src/layouts/components/horizontal/AppBarContent.js`

const filesToCopyTSX = [
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
  `${pathConfig.fullVersionTSXPath}/package.json`,
  `${pathConfig.fullVersionTSXPath}/tsconfig.json`
]

const filesToCopyJSX = [
  `${pathConfig.fullVersionJSXPath}/src`,
  `${pathConfig.fullVersionJSXPath}/styles`,
  `${pathConfig.fullVersionJSXPath}/.editorconfig`,
  `${pathConfig.fullVersionJSXPath}/.env`,
  `${pathConfig.fullVersionJSXPath}/.eslintrc.js`,
  `${pathConfig.fullVersionJSXPath}/.gitignore`,
  `${pathConfig.fullVersionJSXPath}/.prettierrc.js`,
  `${pathConfig.fullVersionJSXPath}/next.config.js`,
  `${pathConfig.fullVersionJSXPath}/package.json`,
  `${pathConfig.fullVersionJSXPath}/jsconfig.json`
]

const foldersToRemoveTSX = [
  `${pathConfig.starterKitTSXPath}/src/views`,
  `${pathConfig.starterKitTSXPath}/src/store`,
  `${pathConfig.starterKitTSXPath}/src/types`,
  `${pathConfig.starterKitTSXPath}/src/@fake-db`,
  `${pathConfig.starterKitTSXPath}/public/locales`
]

const foldersToRemoveJSX = [
  `${pathConfig.starterKitJSXPath}/src/views`,
  `${pathConfig.starterKitJSXPath}/src/store`,
  `${pathConfig.starterKitJSXPath}/src/types`,
  `${pathConfig.starterKitJSXPath}/src/@fake-db`,
  `${pathConfig.starterKitJSXPath}/public/locales`
]

const foldersToKeepTSX = [
  'views/pages/auth',
  'views/pages/misc',
  'pages/forgot-password',
  'pages/acl',
  'pages/login',
  'pages/register',
  'pages/_app.tsx',
  'pages/_document.tsx',
  'pages/401.tsx',
  'pages/404.tsx',
  'pages/500.tsx',
  'pages/index.tsx'
]

const foldersToKeepJSX = [
  'views/pages/auth',
  'views/pages/misc',
  'pages/forgot-password',
  'pages/acl',
  'pages/login',
  'pages/register',
  'pages/_app.js',
  'pages/_document.js',
  'pages/401.js',
  'pages/404.js',
  'pages/500.js',
  'pages/index.js'
]

const filesToReplace = [
  {
    src: './components/tsx/AppBarContentVertical.tsx',
    dest: appbarVerticalPathTSX
  },
  {
    src: './components/jsx/AppBarContentVertical.js',
    dest: appbarVerticalPathJSX
  },
  {
    src: './components/tsx/AppBarContentHorizontal.tsx',
    dest: appbarHorizontalPathTSX
  },
  {
    src: './components/jsx/AppBarContentHorizontal.js',
    dest: appbarHorizontalPathJSX
  },
  {
    src: './components/tsx/navigationVertical.ts',
    dest: navigationVerticalPathTSX
  },
  {
    src: './components/jsx/navigationVertical.js',
    dest: navigationVerticalPathJSX
  },
  {
    src: './components/tsx/navigationHorizontal.ts',
    dest: navigationHorizontalPathTSX
  },
  {
    src: './components/jsx/navigationHorizontal.js',
    dest: navigationHorizontalPathJSX
  },
  {
    src: './components/tsx/index.tsx',
    dest: HomePathTSX
  },
  {
    src: './components/jsx/index.js',
    dest: HomePathJSX
  }
]

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    !fs.existsSync(dest)
      ? fs.mkdirSync(dest, { recursive: true, force: true })
      : null
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      )
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

const appDataToReplace = [
  { from: "import 'src/configs/i18n'", to: '' },
  { from: "import { store } from 'src/store'", to: '' },
  { from: "import { Provider } from 'react-redux'", to: '' },
  { from: '<Provider store={store}>', to: '' },
  { from: ' </Provider>', to: '' },
  { from: new RegExp(/\/\/ \*\* Store Imports/), to: '' }
]

const dataToReplace = [
  {
    file: userLayoutPathTSX,
    replacements: [
      {
        from: "import BuyNowButton from './components/BuyNowButton'",
        to: ''
      },
      {
        from: '<BuyNowButton />',
        to: ''
      },
      {
        from: 'HorizontalAppBarContent hidden={hidden}',
        to: 'HorizontalAppBarContent'
      }
    ]
  },
  {
    file: userLayoutPathJSX,
    replacements: [
      {
        from: "import BuyNowButton from './components/BuyNowButton'",
        to: ''
      },
      {
        from: '<BuyNowButton />',
        to: ''
      },
      {
        from: 'HorizontalAppBarContent hidden={hidden}',
        to: 'HorizontalAppBarContent'
      }
    ]
  },
  {
    file: PackageJSONPathTSX,
    replacements: [
      {
        from: /\^/g,
        to: ''
      },
      {
        from: '~',
        to: ''
      }
    ]
  },
  {
    file: PackageJSONPathJSX,
    replacements: [
      {
        from: /\^/g,
        to: ''
      },
      {
        from: '~',
        to: ''
      }
    ]
  },
  {
    file: TranslationsPathTSX,
    replacements: [
      {
        from: "import { useTranslation } from 'react-i18next'",
        to: ''
      },
      { from: new RegExp(/\/\/ \*\* Third Party Import/), to: '' },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      {
        from: 'const { t } = useTranslation()',
        to: ''
      },
      {
        from: '{`${t(text)}`}',
        to: '{text}'
      }
    ]
  },
  {
    file: TranslationsPathJSX,
    replacements: [
      {
        from: "import { useTranslation } from 'react-i18next'",
        to: ''
      },
      { from: new RegExp(/\/\/ \*\* Third Party Import/), to: '' },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      {
        from: 'const { t } = useTranslation()',
        to: ''
      },
      {
        from: '{`${t(text)}`}',
        to: '{text}'
      }
    ]
  },
  {
    file: AppPathTSX,
    replacements: appDataToReplace
  },
  {
    file: AppPathJSX,
    replacements: appDataToReplace
  },
  {
    file: themeConfigPathTSX,
    replacements: [
      {
        from: 'disableCustomizer: false',
        to: 'disableCustomizer: true'
      }
    ]
  },
  {
    file: themeConfigPathJSX,
    replacements: [
      {
        from: 'disableCustomizer: false',
        to: 'disableCustomizer: true'
      }
    ]
  },
  {
    file: `${pathConfig.starterKitTSXPath}/src/layouts/components/vertical/AppBarContent.tsx`,
    replacements: [
      {
        from: "import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'",
        to: "import UserDropdown from 'src/layouts/components/UserDropdown'"
      }
    ]
  },
  {
    file: `${pathConfig.starterKitTSXPath}/src/layouts/components/horizontal/AppBarContent.tsx`,
    replacements: [
      {
        from: "import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'",
        to: "import UserDropdown from 'src/layouts/components/UserDropdown'"
      }
    ]
  },
  {
    file: `${pathConfig.starterKitJSXPath}/src/layouts/components/vertical/AppBarContent.js`,
    replacements: [
      {
        from: "import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'",
        to: "import UserDropdown from 'src/layouts/components/UserDropdown'"
      }
    ]
  },
  {
    file: `${pathConfig.starterKitJSXPath}/src/layouts/components/horizontal/AppBarContent.js`,
    replacements: [
      {
        from: "import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'",
        to: "import UserDropdown from 'src/layouts/components/UserDropdown'"
      }
    ]
  }
]

const filesToRemove = [
  BuyNowComponentPathTSX,
  BuyNowComponentPathJSX,
  `${pathConfig.starterKitTSXPath}/src/configs/i18n.ts`,
  `${pathConfig.starterKitJSXPath}/src/configs/i18n.js`,
  `${pathConfig.starterKitTSXPath}/src/layouts/components/Autocomplete.tsx`,
  `${pathConfig.starterKitJSXPath}/src/layouts/components/Autocomplete.js`,
  `${pathConfig.starterKitTSXPath}/src/layouts/components/autocompleteIconObj.ts`,
  `${pathConfig.starterKitJSXPath}/src/layouts/components/autocompleteIconObj.js`,
  `${pathConfig.starterKitTSXPath}/src/context/FirebaseContext.tsx`,
  `${pathConfig.starterKitJSXPath}/src/context/FirebaseContext.js`,
  `${pathConfig.starterKitTSXPath}/src/hooks/useFirebaseAuth.tsx`,
  `${pathConfig.starterKitJSXPath}/src/hooks/useFirebaseAuth.js`,
  `${pathConfig.starterKitTSXPath}/src/views/pages/auth/FooterIllustrationsV1.tsx`,
  `${pathConfig.starterKitJSXPath}/src/views/pages/auth/FooterIllustrationsV1.js`
]


const homeAndSecondPagePaths = [
  {
    from: './components/tsx/second-page',
    to: `${pathConfig.starterKitTSXPath}/src/pages/second-page`
  },
  {
    from: './components/tsx/home',
    to: `${pathConfig.starterKitTSXPath}/src/pages/home`
  },
  {
    from: './components/jsx/second-page',
    to: `${pathConfig.starterKitJSXPath}/src/pages/second-page`
  },
  {
    from: './components/jsx/home',
    to: `${pathConfig.starterKitJSXPath}/src/pages/home`
  }
]

const imgFilesToKeep = [
  '/public/vercel.svg'
]

module.exports = {
  AppPathTSX,
  AppPathJSX,
  LoginPathTSX,
  LoginPathJSX,
  filesToRemove,
  imgFilesToKeep,
  filesToCopyTSX,
  filesToCopyJSX,
  filesToReplace,
  RegisterPathTSX,
  RegisterPathJSX,
  dataToReplace,
  foldersToKeepTSX,
  appDataToReplace,
  foldersToKeepJSX,
  copyRecursiveSync,
  userLayoutPathTSX,
  userLayoutPathJSX,
  themeConfigPathTSX,
  themeConfigPathJSX,
  PackageJSONPathTSX,
  PackageJSONPathJSX,
  foldersToRemoveTSX,
  foldersToRemoveJSX,
  TranslationsPathTSX,
  TranslationsPathJSX,
  appbarVerticalPathTSX,
  appbarVerticalPathJSX,
  homeAndSecondPagePaths,
  BuyNowComponentPathTSX,
  BuyNowComponentPathJSX,
  appbarHorizontalPathTSX,
  appbarHorizontalPathJSX
}
