import fs from 'fs-extra'
import type { PackageJson } from 'type-fest'
import { error, info } from '@/utils/logging'
import { ask } from '@/utils/node'
export const generateDocContent = (pageTitle: string, docUrl: string) => {
  return `<!DOCTYPE html>
<html>
<head>
   <title>${pageTitle}</title>
   <meta http-equiv="refresh" content="0; URL='${docUrl}'" />
</head>
<body>
   <p>If you do not redirect please visit: ${docUrl}</p>
</body>
</html>`
}

export const validateSemanticVersion = (version: string) => {
  if (!/(\d\.){2}\d/.test(version))
    error(`version: ${version} doesn't match the pattern. e.g. 0.0.0`)
}

export const updatePkgJsonVersion = async (pkgJsonPaths: string[], pkgJsonSrcPath: string, packageVersionToUpdate?: string) => {
  let newVersion = packageVersionToUpdate

  const pkgJson: PackageJson = fs.readJsonSync(pkgJsonSrcPath)

  if (!newVersion)
    newVersion = await ask(`Optional, Update package version in package.json. (Current version: ${pkgJson.version as string}) Don't prefix 'v': `)

  // ℹ️ Check if newVersion exist either via function param or CLI prompt
  if (newVersion) {
    // Check if input is valid version
    validateSemanticVersion(newVersion)

    // Loop over all package.json files and update version
    pkgJsonPaths.forEach((pkgJsonPath) => {
      const pkgJson: PackageJson = fs.readJSONSync(pkgJsonPath)
      pkgJson.version = newVersion

      fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 })
    })

    return newVersion
  }
  else {
    info('Ignoring version update!')

    return (pkgJson.version as string)
  }
}
