const fs = require('fs')
const path = require('path')

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    if (!src.includes('node_modules')) {
      !fs.existsSync(dest)
        ? fs.mkdirSync(dest, { recursive: true, force: true })
        : null
      fs.readdirSync(src).forEach(function (childItemName) {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        )
      })
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}

// ** Copy TS Version
copyRecursiveSync(
  '../../../materio-mui-react-nextjs-admin-template-free-internal/typescript-version',
  '../../../materio-mui-react-nextjs-admin-template-free/typescript-version'
)

// ** Copy JS Version if exists
if (
  fs.existsSync(
    '../../../materio-mui-react-nextjs-admin-template-free-internal/javascript-version'
  )
) {
  copyRecursiveSync(
    '../../../materio-mui-react-nextjs-admin-template-free-internal/javascript-version',
    '../../../materio-mui-react-nextjs-admin-template-free/javascript-version'
  )
}
