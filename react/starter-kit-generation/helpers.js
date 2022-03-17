const fs = require('fs')
const path = require('path')
const pathConfig = require('../configs/paths.json')

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
  `${pathConfig.fullVersionTSXPath}/package.json`,
  `${pathConfig.fullVersionTSXPath}/tsconfig.json`
]

const filesToCopyJSX = [
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
  },
  {
    src: `${pathConfig.fullVersionTSXPath}/src/pages/pages/auth/login-v2/index.tsx`,
    dest: `${pathConfig.starterKitTSXPath}/src/pages/login/index.tsx`
  },
  {
    src: `${pathConfig.fullVersionJSXPath}/src/pages/pages/auth/login-v2/index.js`,
    dest: `${pathConfig.starterKitJSXPath}/src/pages/login/index.js`
  },
  {
    src: `${pathConfig.fullVersionTSXPath}/src/pages/pages/auth/register-v2/index.tsx`,
    dest: `${pathConfig.starterKitTSXPath}/src/pages/register/index.tsx`
  },
  {
    src: `${pathConfig.fullVersionJSXPath}/src/pages/pages/auth/register-v2/index.js`,
    dest: `${pathConfig.starterKitJSXPath}/src/pages/register/index.js`
  },
  {
    src: `${pathConfig.fullVersionJSXPath}/src/pages/pages/auth/login-v2/index.js`,
    dest: `${pathConfig.starterKitJSXPath}/src/pages/login/index.js`
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
  { from: "import { ReactNode } from 'react'", to: '' },
  { from: "import 'src/@fake-db'", to: '' },
  { from: "import 'src/configs/i18n'", to: '' },
  { from: "import { defaultACLObj } from 'src/configs/acl'", to: '' },
  { from: "import AclGuard from 'src/@core/components/auth/AclGuard'", to: '' },
  { from: "import { AuthProvider } from 'src/context/AuthContext'", to: '' },
  {
    from: "import AuthGuard from 'src/@core/components/auth/AuthGuard'",
    to: ''
  },
  {
    from: "import GuestGuard from 'src/@core/components/auth/GuestGuard'",
    to: ''
  },
  { from: "import Spinner from 'src/@core/components/spinner'", to: '' },
  { from: "import { store } from 'src/store'", to: '' },
  { from: "import { Provider } from 'react-redux'", to: '' },
  { from: '<Provider store={store}>', to: '' },
  { from: ' </Provider>', to: '' },
  { from: '<AuthProvider>', to: '' },
  { from: '</AuthProvider>', to: '' },
  {
    from: '<AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard}>',
    to: ''
  },
  { from: '</AclGuard>', to: '' },
  { from: '<Guard authGuard={authGuard} guestGuard={guestGuard}>', to: '' },
  { from: '</Guard>', to: '' },
  {
    from: new RegExp(/const Guard[\s\S]*?<\/AuthGuard>[\s\S]*?}[\s\S]*?}/),
    to: ''
  },
  { from: new RegExp(/type GuardProps[\s\S]*?ReactNode[\s\S]*?}/), to: '' },
  { from: new RegExp(/\/\/ \*\* React Imports/), to: '' },
  { from: new RegExp(/\/\/ \*\* Store Imports/), to: '' },
  { from: new RegExp(/\/\/ \*\* Fake-DB Import/), to: '' },
  { from: new RegExp(/\/\/ \*\* Spinner Import/), to: '' },
  { from: 'const authGuard = Component.authGuard ?? true', to: '' },
  { from: 'const guestGuard = Component.guestGuard ?? false', to: '' },
  { from: 'const aclAbilities = Component.acl ?? defaultACLObj', to: '' }
]

const newLoginBtn = `<Link href='/' passHref>
     <Button fullWidth size='large' type='submit' variant='contained' sx={{ marginBottom: 7 }}>
      Login
      </Button>
</Link>`

const newRegisterBtn = `<Link href='/' passHref>
     <Button fullWidth size='large' type='submit' variant='contained' sx={{ marginBottom: 7 }}>
      Register
      </Button>
</Link>`

const dataToReplace = [
  {
    file: `${pathConfig.starterKitTSXPath}/src/layouts/components/acl/CanViewNavGroup.tsx`,
    replacements: [
      {
        from: "import { ReactNode, useContext } from 'react'",
        to: "import { ReactNode } from 'react'"
      },
      {
        from: "import { NavGroup, NavLink } from 'src/@core/layouts/types'",
        to: "import { NavGroup } from 'src/@core/layouts/types'"
      },
      { from: new RegExp(/\/\/ \*\* Component Imports/), to: '' },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: 'const { children, navGroup } = props',
        to: 'const { children } = props'
      },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      { from: 'const ability = useContext(AbilityContext)', to: '' },
      {
        from: new RegExp(
          /const canViewMenuGroup[\s\S]*?&& hasAnyVisibleChild[\s\S]*?}/
        ),
        to: ''
      },
      {
        from: 'return navGroup && canViewMenuGroup(navGroup) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.starterKitTSXPath}/src/layouts/components/acl/CanViewNavLink.tsx`,
    replacements: [
      {
        from: "import { ReactNode, useContext } from 'react'",
        to: "import { ReactNode } from 'react'"
      },
      { from: new RegExp(/\/\/ \*\* Component Imports/), to: '' },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: 'const { children, navLink } = props',
        to: 'const { children } = props'
      },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      { from: 'const ability = useContext(AbilityContext)', to: '' },
      {
        from: 'return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.starterKitTSXPath}/src/layouts/components/acl/CanViewNavSectionTitle.tsx`,
    replacements: [
      {
        from: "import { ReactNode, useContext } from 'react'",
        to: "import { ReactNode } from 'react'"
      },
      { from: new RegExp(/\/\/ \*\* Component Imports/), to: '' },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: 'const { children, navTitle } = props',
        to: 'const { children } = props'
      },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      { from: 'const ability = useContext(AbilityContext)', to: '' },
      {
        from: 'return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.starterKitJSXPath}/src/layouts/components/acl/CanViewNavGroup.js`,
    replacements: [
      { from: new RegExp(/\/\/ \*\* React Imports/), to: '' },
      { from: "import { useContext } from 'react'", to: '' },
      { from: new RegExp(/\/\/ \*\* Component Imports/), to: '' },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: 'const { children, navGroup } = props',
        to: 'const { children } = props'
      },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      { from: 'const ability = useContext(AbilityContext)', to: '' },
      {
        from: new RegExp(
          /const canViewMenuGroup[\s\S]*?&& hasAnyVisibleChild[\s\S]*?}/
        ),
        to: ''
      },
      {
        from: 'return navGroup && canViewMenuGroup(navGroup) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.starterKitJSXPath}/src/layouts/components/acl/CanViewNavLink.js`,
    replacements: [
      { from: new RegExp(/\/\/ \*\* React Imports/), to: '' },
      { from: "import { useContext } from 'react'", to: '' },
      { from: new RegExp(/\/\/ \*\* Component Imports/), to: '' },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: 'const { children, navLink } = props',
        to: 'const { children } = props'
      },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      { from: 'const ability = useContext(AbilityContext)', to: '' },
      {
        from: 'return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.starterKitJSXPath}/src/layouts/components/acl/CanViewNavSectionTitle.js`,
    replacements: [
      { from: new RegExp(/\/\/ \*\* React Imports/), to: '' },
      { from: "import { useContext } from 'react'", to: '' },
      { from: new RegExp(/\/\/ \*\* Component Imports/), to: '' },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: 'const { children, navTitle } = props',
        to: 'const { children } = props'
      },
      { from: new RegExp(/\/\/ \*\* Hook/), to: '' },
      { from: 'const ability = useContext(AbilityContext)', to: '' },
      {
        from: 'return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
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
    file: LoginPathTSX,
    replacements: [
      {
        from: '/pages/auth/forgot-password-v2',
        to: '/forgot-password'
      },
      {
        from: '/pages/auth/register-v2',
        to: '/register'
      },
      {
        from: new RegExp('LoginV2', 'g'),
        to: 'Login'
      },
      {
        from: new RegExp(/<Button .*>[\s\S]*? <\/Button>/),
        to: newLoginBtn
      }
    ]
  },
  {
    file: LoginPathJSX,
    replacements: [
      {
        from: '/pages/auth/forgot-password-v2',
        to: '/forgot-password'
      },
      {
        from: '/pages/auth/register-v2',
        to: '/register'
      },
      {
        from: new RegExp('LoginV2', 'g'),
        to: 'Login'
      },
      {
        from: new RegExp(/<Button .*>[\s\S]*? <\/Button>/),
        to: newLoginBtn
      }
    ]
  },
  {
    file: RegisterPathTSX,
    replacements: [
      {
        from: '/pages/auth/login-v2',
        to: '/login'
      },
      {
        from: new RegExp('RegisterV2', 'g'),
        to: 'Register'
      },
      {
        from: new RegExp(/<Button .*>[\s\S]*? <\/Button>/),
        to: newRegisterBtn
      }
    ]
  },
  {
    file: RegisterPathJSX,
    replacements: [
      {
        from: '/pages/auth/login-v2',
        to: '/login'
      },
      {
        from: new RegExp('RegisterV2', 'g'),
        to: 'Register'
      },
      {
        from: new RegExp(/<Button .*>[\s\S]*? <\/Button>/),
        to: newRegisterBtn
      }
    ]
  },
  {
    file: `${pathConfig.starterKitTSXPath}/src/next.d.ts`,
    replacements: [
      {
        from: "import type { ACLObj } from 'src/configs/acl'",
        to: ''
      },
      {
        from: 'acl?: ACLObj',
        to: ''
      },
      {
        from: 'authGuard?: boolean',
        to: ''
      },
      {
        from: 'guestGuard?: boolean',
        to: ''
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
  `${pathConfig.starterKitTSXPath}/src/configs/acl.ts`,
  `${pathConfig.starterKitJSXPath}/src/configs/acl.js`,
  `${pathConfig.starterKitTSXPath}/src/configs/auth.ts`,
  `${pathConfig.starterKitJSXPath}/src/configs/auth.js`,
  `${pathConfig.starterKitTSXPath}/src/configs/i18n.ts`,
  `${pathConfig.starterKitJSXPath}/src/configs/i18n.js`
]

const imgFilesToKeep = [
  '/images/favicon.png',
  '/images/pages/401.png',
  '/images/pages/404.png',
  '/images/pages/500.png',
  '/images/avatars/1.png',
  '/images/pages/tree.png',
  '/images/pages/tree-2.png',
  '/images/pages/tree-3.png',
  '/images/apple-touch-icon.png',
  '/images/pages/auth-v1-tree.png',
  '/images/pages/auth-v1-tree-2.png',
  '/images/pages/misc-mask-dark.png',
  '/images/pages/misc-mask-light.png',
  '/images/pages/auth-v2-mask-dark.png',
  '/images/pages/auth-v1-mask-dark.png',
  '/images/pages/auth-v1-mask-light.png',
  '/images/pages/auth-v2-mask-light.png',
  '/images/pages/auth-v2-login-illustration-dark.png',
  '/images/pages/auth-v2-login-illustration-light.png',
  '/images/pages/auth-v2-register-illustration-dark.png',
  '/images/pages/auth-v2-register-illustration-light.png',
  '/images/pages/auth-v2-forgot-password-illustration-dark.png',
  '/images/pages/auth-v2-forgot-password-illustration-light.png'
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
  BuyNowComponentPathTSX,
  BuyNowComponentPathJSX,
  appbarHorizontalPathTSX,
  appbarHorizontalPathJSX
}
