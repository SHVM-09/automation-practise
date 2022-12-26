const fs = require('fs')
const path = require('path')
const pathConfig = require('../../configs/paths.json')

const fullVersionPath = pathConfig.fullVersionTSXPath.replace('-free', '')

const foldersToKeep = [
  `${fullVersionPath}/src/pages/ui/icons`,
  `${fullVersionPath}/src/views/table/mui`,
  `${fullVersionPath}/src/pages/tables/mui`,
  `${fullVersionPath}/src/views/pages/misc`,
  `${fullVersionPath}/src/views/pages/auth`,
  `${fullVersionPath}/src/pages/ui/typography`,
  `${fullVersionPath}/src/views/ui/typography`,
  `${fullVersionPath}/src/pages/forms/form-layouts`,
  `${fullVersionPath}/src/views/forms/form-layouts`,
  {
    to: `${pathConfig.basePathTSX}/src/pages/login`,
    from: `${fullVersionPath}/src/pages/pages/auth/login-v1`
  },
  {
    to: `${pathConfig.basePathTSX}/src/pages/register`,
    from: `${fullVersionPath}/src/pages/pages/auth/register-v1`
  },
  {
    from: `${fullVersionPath}/src/pages/ui/cards/basic/`,
    to: `${pathConfig.basePathTSX}/src/pages/ui/cards/`
  },
  {
    from: `${fullVersionPath}/src/views/ui/cards/basic`,
    to: `${pathConfig.basePathTSX}/src/views/ui/cards`
  }
]

const filesToKeep = [
  `${fullVersionPath}/src/pages/401.tsx`,
  `${fullVersionPath}/src/pages/404.tsx`,
  `${fullVersionPath}/src/pages/500.tsx`,
  `${fullVersionPath}/src/pages/_app.tsx`,
  `${fullVersionPath}/src/pages/index.tsx`,
  `${fullVersionPath}/src/pages/_document.tsx`,
  `${fullVersionPath}/src/views/pages/auth/FooterIllustrationsV1.tsx`
]

const foldersToDelete = [
  `${pathConfig.basePathTSX}/src/hooks`,
  `${pathConfig.basePathTSX}/src/store`,
  `${pathConfig.basePathTSX}/src/context`,
  `${pathConfig.basePathTSX}/src/@fake-db`,
  `${pathConfig.basePathTSX}/src/types/apps`,
  `${pathConfig.basePathTSX}/src/configs/acl.ts`,
  `${pathConfig.basePathTSX}/src/configs/auth.ts`,
  `${pathConfig.basePathTSX}/src/configs/i18n.ts`,
  `${pathConfig.basePathTSX}/src/@core/styles/mui`,
  `${pathConfig.basePathTSX}/src/@core/components/auth`,
  `${pathConfig.basePathTSX}/src/navigation/horizontal`,
  `${pathConfig.basePathTSX}/src/layouts/components/acl`,
  `${pathConfig.basePathTSX}/src/@core/components/sidebar`,
  `${pathConfig.basePathTSX}/src/@core/components/repeater`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/recharts`,
  `${pathConfig.basePathTSX}/src/@core/hook/useClipboard.tsx`,
  `${pathConfig.basePathTSX}/src/@core/components/customizer`,
  `${pathConfig.basePathTSX}/src/layouts/components/horizontal`,
  `${pathConfig.basePathTSX}/src/@core/components/custom-radio`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/keen-slider`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/react-cleave`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/fullcalendar`,
  `${pathConfig.basePathTSX}/src/@core/components/custom-checkbox`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/react-dropzone`,
  `${pathConfig.basePathTSX}/src/layouts/components/Direction.tsx`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/react-hot-toast`,
  `${pathConfig.basePathTSX}/src/@core/layouts/HorizontalLayout.tsx`,
  `${pathConfig.basePathTSX}/src/layouts/components/Autocomplete.tsx`,
  `${pathConfig.basePathTSX}/src/layouts/components/BuyNowButton.tsx`,
  `${pathConfig.basePathTSX}/src/layouts/components/Translations.tsx`,
  `${pathConfig.basePathTSX}/src/@core/layouts/components/horizontal`,
  `${pathConfig.basePathTSX}/src/@core/components/react-draft-wysiwyg`,
  `${pathConfig.basePathTSX}/src/@core/styles/libs/react-draft-wysiwyg`,
  `${pathConfig.basePathTSX}/src/@core/layouts/BlankLayoutWithAppBar.tsx`,
  `${pathConfig.basePathTSX}/src/@core/layouts/components/blank-layout-with-appBar`,
  `${pathConfig.basePathTSX}/src/layouts/components/vertical/ServerSideNavItems.tsx`,
  `${pathConfig.basePathTSX}/src/@core/layouts/components/shared-components/LanguageDropdown.tsx`,
  `${pathConfig.basePathTSX}/src/@core/layouts/components/shared-components/ShortcutsDropdown.tsx`
]

const coreFilesToModify = [
  {
    from: `${pathConfig.basePathTSX}/src/@core/layouts/Layout.tsx`,
    to: `./components/Layout.tsx`
  },
  {
    from: `${pathConfig.basePathTSX}/src/layouts/UserLayout.tsx`,
    to: `./components/UserLayout.tsx`
  }
]

const dataToReplace = [
  {
    file: `${pathConfig.basePathTSX}/src/pages/_app.tsx`,
    replacements: [
      {
        from: new RegExp(/\/\/ \*\* React Imports/),
        to: ''
      },
      {
        from: "import { ReactNode } from 'react'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Styled Components/),
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Third Party Import/),
        to: ''
      },
      {
        from: "import { Toaster } from 'react-hot-toast'",
        to: ''
      },

      {
        from: new RegExp(/\/\/ \*\* Store Imports/),
        to: ''
      },
      {
        from: "import { store } from 'src/store'",
        to: ''
      },
      {
        from: "import { Provider } from 'react-redux'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Config Imports/),
        to: ''
      },
      {
        from: "import 'src/configs/i18n'",
        to: ''
      },
      {
        from: "import { defaultACLObj } from 'src/configs/acl'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Spinner Import/),
        to: ''
      },
      {
        from: "import Spinner from 'src/@core/components/spinner'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Fake-DB Import/),
        to: ''
      },
      {
        from: "import 'src/@fake-db'",
        to: ''
      },
      {
        from: "import AclGuard from 'src/@core/components/auth/AclGuard'",
        to: ''
      },
      {
        from: "import AuthGuard from 'src/@core/components/auth/AuthGuard'",
        to: ''
      },
      {
        from: "import GuestGuard from 'src/@core/components/auth/GuestGuard'",
        to: ''
      },
      {
        from: "import { AuthProvider } from 'src/context/AuthContext'",
        to: ''
      },
      {
        from: "import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'",
        to: ''
      },
      {
        from: /[\s]*?type GuardProps.*\s+(\S+).*\s+(\S+).*\s+(\S+).*\s+(\S+)/m,
        to: ''
      },
      {
        from: /[\s]*?const Guard.*\s+(\S+).*\s+(\S+).*\s+(\S+).*\s+(\S+).*\s+(\S+).*\s+(\S+).*\s+(\S+).*\s+(\S+)/m,
        to: ''
      },
      {
        from: 'const authGuard = Component.authGuard ?? true',
        to: ''
      },
      {
        from: 'const guestGuard = Component.guestGuard ?? false',
        to: ''
      },
      {
        from: 'const aclAbilities = Component.acl ?? defaultACLObj',
        to: ''
      },
      {
        from: '<Provider store={store}>',
        to: ''
      },
      {
        from: '</Provider>',
        to: ''
      },
      {
        from: '<AuthProvider>',
        to: ''
      },
      {
        from: '</AuthProvider>',
        to: ''
      },
      {
        from: '<Guard authGuard={authGuard} guestGuard={guestGuard}>',
        to: ''
      },
      {
        from: '</Guard>',
        to: ''
      },
      {
        from: '<AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard}>',
        to: ''
      },
      {
        from: '</AclGuard>',
        to: ''
      },
      {
        from: '<ReactHotToast>',
        to: ''
      },
      {
        from: "<Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />",
        to: ''
      },
      {
        from: '</ReactHotToast>',
        to: ''
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/@core/layouts/VerticalLayout.tsx`,
    replacements: [
      {
        from: "import Customizer from 'src/@core/components/customizer'",
        to: ''
      },
      {
        from: 'hidden, ',
        to: ''
      },
      {
        from: 'disableCustomizer, ',
        to: ''
      },
      {
        from: '{/* Customizer */}',
        to: ''
      },
      {
        from: '{disableCustomizer || hidden ? null : <Customizer />}',
        to: ''
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/layouts/components/acl/CanViewNavSectionTitle.tsx`,
    replacements: [
      {
        from: ', useContext',
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Component Imports/),
        to: ''
      },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Types/),
        to: ''
      },
      {
        from: "import { NavSectionTitle } from 'src/@core/layouts/types'",
        to: ''
      },
      {
        from: 'navTitle?: NavSectionTitle',
        to: ''
      },
      {
        from: 'const { children, navTitle } = props',
        to: 'const { children } = props'
      },
      {
        from: new RegExp(/\/\/ \*\* Hook/),
        to: ''
      },
      {
        from: 'const ability = useContext(AbilityContext)',
        to: ''
      },
      {
        from: 'return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/layouts/components/acl/CanViewNavLink.tsx`,
    replacements: [
      {
        from: ', useContext',
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Component Imports/),
        to: ''
      },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Types/),
        to: ''
      },
      {
        from: "import { NavLink } from 'src/@core/layouts/types'",
        to: ''
      },
      {
        from: 'navLink?: NavLink',
        to: ''
      },
      {
        from: 'const { children, navLink } = props',
        to: 'const { children } = props'
      },
      {
        from: new RegExp(/\/\/ \*\* Hook/),
        to: ''
      },
      {
        from: 'const ability = useContext(AbilityContext)',
        to: ''
      },
      {
        from: 'return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/layouts/components/acl/CanViewNavGroup.tsx`,
    replacements: [
      {
        from: ', useContext',
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Component Imports/),
        to: ''
      },
      {
        from: "import { AbilityContext } from 'src/layouts/components/acl/Can'",
        to: ''
      },
      {
        from: new RegExp(/\/\/ \*\* Types/),
        to: ''
      },
      {
        from: "import { NavGroup, NavLink } from 'src/@core/layouts/types'",
        to: ''
      },
      {
        from: 'navGroup?: NavGroup',
        to: ''
      },
      {
        from: 'const { children, navGroup } = props',
        to: 'const { children } = props'
      },
      {
        from: new RegExp(/\/\/ \*\* Hook/),
        to: ''
      },
      {
        from: /const canViewMenuGroup[\s]{[\s\S]*?\n}/m,
        to: ''
      },
      {
        from: 'const ability = useContext(AbilityContext)',
        to: ''
      },
      {
        from: 'return navGroup && canViewMenuGroup(navGroup) ? <>{children}</> : null',
        to: 'return <>{children}</>'
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/layouts/components/vertical/AppBarContent.tsx`,
    replacements: [
      {
        from: "import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown'",
        to: ''
      },
      {
        from: "import Autocomplete from 'src/layouts/components/Autocomplete'",
        to: ''
      },
      {
        from: "import ShortcutsDropdown, { ShortcutsType } from 'src/@core/layouts/components/shared-components/ShortcutsDropdown'",
        to: ''
      },
      {
        from: '<LanguageDropdown settings={settings} saveSettings={saveSettings} />',
        to: ''
      },
      {
        from: '<ShortcutsDropdown settings={settings} shortcuts={shortcuts} />',
        to: ''
      },
      {
        from: '<Autocomplete hidden={hidden} settings={settings} />',
        to: ''
      },
      {
        from: /const shortcuts.*(\n|.)*?]/,
        to: ''
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/@core/layouts/components/vertical/navigation/VerticalNavGroup.tsx`,
    replacements: [
      {
        from: "import CanViewNavGroup from 'src/layouts/components/acl/CanViewNavGroup'",
        to: ''
      },
      {
        from: "import Translations from 'src/layouts/components/Translations'",
        to: ''
      },
      {
        from: '<CanViewNavGroup navGroup={item}>',
        to: ''
      },
      {
        from: '</CanViewNavGroup>',
        to: ''
      },
      {
        from: '<Translations text={item.title} />',
        to: '{item.title}'
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/@core/layouts/components/vertical/navigation/VerticalNavLink.tsx`,
    replacements: [
      {
        from: "import CanViewNavLink from 'src/layouts/components/acl/CanViewNavLink'",
        to: ''
      },
      {
        from: "import Translations from 'src/layouts/components/Translations'",
        to: ''
      },
      {
        from: '<CanViewNavLink navLink={item}>',
        to: ''
      },
      {
        from: '</CanViewNavLink>',
        to: ''
      },
      {
        from: '<Translations text={item.title} />',
        to: '{item.title}'
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/@core/layouts/components/vertical/navigation/VerticalNavSectionTitle.tsx`,
    replacements: [
      {
        from: "import CanViewNavSectionTitle from 'src/layouts/components/acl/CanViewNavSectionTitle'",
        to: ''
      },
      {
        from: "import Translations from 'src/layouts/components/Translations'",
        to: ''
      },
      {
        from: '<CanViewNavSectionTitle navTitle={item}>',
        to: ''
      },
      {
        from: '</CanViewNavSectionTitle>',
        to: ''
      },
      {
        from: '<Translations text={item.sectionTitle} />',
        to: '{item.sectionTitle}'
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/@core/theme/ThemeComponent.tsx`,
    replacements: [
      {
        from: new RegExp(/\/\/ \*\* Direction component for LTR or RTL/),
        to: ''
      },
      {
        from: "import Direction from 'src/layouts/components/Direction'",
        to: ''
      },
      {
        from: '<Direction direction={settings.direction}>',
        to: ''
      },
      {
        from: '</Direction>',
        to: ''
      }
    ]
  },
  {
    file: `${pathConfig.basePathTSX}/src/layouts/UserLayout.tsx`,
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
    file: `${pathConfig.basePathTSX}/src/@core/layouts/components/shared-components/UserDropdown.tsx`,
    replacements: [
      {
        from: new RegExp(/\/\/ \*\* Context/),
        to: ''
      },
      {
        from: "import { useAuth } from 'src/hooks/useAuth'",
        to: ''
      },
      {
        from: 'const { logout } = useAuth()',
        to: ''
      },
      {
        from: 'logout()',
        to: ''
      },
      {
        from: new RegExp(/(handleDropdownClose\(')(.*)('.*\))/, 'g'),
        to: 'handleDropdownClose()'
      },
      {
        from: 'onClick={handleLogout}',
        to: "onClick={() => handleDropdownClose('/login')}"
      },
      {
        from: /[\s]*?const handleLogout.*\s+(\S+).*\s+(\S+)/,
        to: ''
      }
    ]
  }
]

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    if (!src.includes('node_modules') && !src.includes('.next')) {
      !fs.existsSync(dest) ? fs.mkdirSync(dest, { recursive: true, force: true }) : null
      fs.readdirSync(src).forEach(function (childItemName) {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
      })
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}

// ** Copy TS Version
const copyTSVersion = () => {
  return new Promise(resolve => {
    copyRecursiveSync(fullVersionPath, pathConfig.basePathTSX)
    resolve()
  })
}

// ** Copy Initial Project
copyTSVersion()
  .then(() => {
    fs.rm(`${pathConfig.basePathTSX}/src/pages`, { force: true, recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Removed pages dir')
      }
    })
  })
  .then(() =>
    fs.rm(`${pathConfig.basePathTSX}/src/views`, { recursive: true }, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Removed views dir')
      }
    })
  )
  // ** Copy Required Folders
  .then(() => {
    setTimeout(
      () =>
        foldersToKeep.forEach(f => {
          if (typeof f === 'string') {
            if (fs.existsSync(f)) {
              const fol = f.substring(f.lastIndexOf('src'))
              copyRecursiveSync(f, `${pathConfig.basePathTSX}/${fol}`)
            }
          } else {
            if (fs.existsSync(f.from)) {
              copyRecursiveSync(f.from, f.to)
            }
          }
        }),
      500
    )
  })
  // ** Copy Required Files
  .then(() => {
    new Promise(resolve => {
      setTimeout(() => {
        filesToKeep.forEach(f => {
          if (fs.existsSync(f)) {
            const file = f.substring(f.lastIndexOf('src'))
            fs.copyFileSync(f, `${pathConfig.basePathTSX}/${file}`)
          }
        })
      }, 500)
      resolve()
    })
      .then(() => {
        setTimeout(() => {
          fs.writeFileSync(
            `${pathConfig.basePathTSX}/src/pages/index.tsx`,
            fs.readFileSync('./components/index.tsx').toString()
          )
        }, 500)
      })
      .then(() => {
        setTimeout(() => {
          fs.writeFileSync(
            `${pathConfig.basePathTSX}/src/pages/ui/cards/index.tsx`,
            fs
              .readFileSync(`${pathConfig.basePathTSX}/src/pages/ui/cards/index.tsx`)
              .toString()
              .replace(new RegExp('src/views/ui/cards/basic/', 'g'), 'src/views/ui/cards/')
          )
        }, 500)
      })
      .then(() => {
        setTimeout(() => {
          fs.rmSync(`${pathConfig.basePathTSX}/src/views/pages/auth/register-multi-steps`, {
            recursive: true,
            force: true
          })
          fs.rmSync(`${pathConfig.basePathTSX}/src/views/pages/auth/FooterIllustrationsV2.tsx`)
        }, 600)
      })
  })
  // ** Copy Dashboard
  .then(() => {
    setTimeout(() => {
      new Promise(resolve => {
        copyRecursiveSync(
          `${fullVersionPath}/src/pages/dashboards/analytics`,
          `${pathConfig.basePathTSX}/src/pages/dashboard`
        )
        resolve()
      })
        .then(() => {
          copyRecursiveSync(
            `${fullVersionPath}/src/views/dashboards/analytics`,
            `${pathConfig.basePathTSX}/src/views/dashboard`
          )
        })
        .then(() => {
          fs.readFile(`${pathConfig.basePathTSX}/src/pages/dashboard/index.tsx`, 'utf-8', (err, data) => {
            if (err) {
              console.log(err)
            } else {
              const replaced = data.replace(new RegExp('src/views/dashboards/analytics/', 'g'), 'src/views/dashboard/')
              fs.writeFileSync(`${pathConfig.basePathTSX}/src/pages/dashboard/index.tsx`, replaced)
            }
          })
        })
    }, 500)
  })
  // ** Copy Navigation
  .then(() => {
    fs.writeFileSync(
      `${pathConfig.basePathTSX}/src/navigation/vertical/index.ts`,
      fs.readFileSync('./components/vertical/index.ts').toString()
    )
  })
  // ** Delete Folders
  .then(() => foldersToDelete.forEach(f => (fs.existsSync(f) ? fs.rmSync(f, { recursive: true, force: true }) : null)))
  // ** Replace Files
  .then(() =>
    coreFilesToModify.forEach(f => {
      fs.writeFileSync(f.from, fs.readFileSync(f.to).toString())
    })
  )
  // ** Replace Data
  .then(() =>
    setTimeout(() => {
      dataToReplace.forEach(f =>
        fs.readFile(f.file, 'utf-8', (err, data) => {
          if (err) {
            console.log(err)
          } else {
            let replaced = data
            f.replacements.forEach(rep => {
              replaced = replaced.replace(rep.from, rep.to)
            })
            fs.writeFile(f.file, '', err => {
              if (err) {
                console.log(err)
              } else {
                fs.writeFileSync(f.file, replaced)
              }
            })
          }
        })
      )
    }, 500)
  )
  // ** Copy Account Settings
  .then(() => {
    setTimeout(() => {
      fs.mkdir(`${pathConfig.basePathTSX}/src/pages/pages/account-settings/`, { recursive: true }, err => {
        if (err) {
          console.log(err)
        } else {
          copyRecursiveSync(
            `${fullVersionPath}/src/views/pages/account-settings/TabAccount.tsx`,
            `${pathConfig.basePathTSX}/src/pages/pages/account-settings/index.tsx`
          )
        }
      })
    }, 1000)
  })
