import * as fs from 'fs'
import consola from 'consola'

// Define the interface for the package.json structure
interface PackageJson {
  [key: string]: any
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  prisma?: { schema: string }
}

// Function to update package.json
export function updatePackageJson(skDirPath: string): void {
  // Path to package.json
  const packageJsonPath = `${skDirPath}/package.json`

  // Packages to remove
  const packagesToKeep: string[] = [
    '@emotion/cache',
    '@emotion/react',
    '@emotion/styled',
    '@floating-ui/react',
    '@iconify/iconify',
    '@iconify/json',
    '@iconify/tools',
    '@iconify/types',
    '@iconify/utils',
    '@mui/lab',
    '@mui/material',
    '@mui/material-nextjs',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'autoprefixer',
    'classnames',
    'eslint',
    'eslint-config-next',
    'eslint-config-prettier',
    'eslint-import-resolver-typescript',
    'eslint-plugin-import',
    'next',
    'postcss',
    'postcss-styled-syntax',
    'prettier',
    'react',
    'react-colorful',
    'react-dom',
    'react-perfect-scrollbar',
    'react-toastify',
    'react-use',
    'stylelint',
    'stylelint-use-logical-spec',
    'stylis',
    'stylis-plugin-rtl',
    'tailwindcss',
    'tailwindcss-logical',
    'tsx',
    'typescript'
  ]

  // Script commands to remove
  const scriptsToRemove: string[] = ['migrate']

  // Script commands to update
  const scriptsToUpdate: Record<string, string> = {
    postinstall: 'npm run build:icons'
  }

  fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      consola.error('Error reading package.json:', err)

      return
    }

    const packageJson: PackageJson = JSON.parse(data)

    // Filter dependencies and devDependencies
    ;['dependencies', 'devDependencies'].forEach(key => {
      if (packageJson[key]) {
        packageJson[key] = Object.fromEntries(
          Object.entries(packageJson[key] as Record<string, string>).filter(([pkgName]) =>
            packagesToKeep.includes(pkgName)
          )
        )
      }
    })

    // Remove specified script commands
    scriptsToRemove.forEach(script => {
      if (packageJson.scripts) delete packageJson.scripts[script]
    })

    // Update specified script commands
    Object.keys(scriptsToUpdate).forEach(script => {
      if (packageJson.scripts) packageJson.scripts[script] = scriptsToUpdate[script]
    })

    // Remove the prisma block
    delete packageJson.prisma

    // Write the updated package.json back
    fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', writeErr => {
      if (writeErr) {
        consola.error('Error writing package.json:', writeErr)

        return
      }

      consola.success('package.json updated successfully.')
    })
  })
}
