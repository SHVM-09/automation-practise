import fs from 'fs-extra'
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

export const updatePkgJsonVersion = async (pkgJsonPaths: string[], pkgJsonSrcPath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkgJson: Record<string, any> = fs.readJsonSync(pkgJsonSrcPath)

  const packageVersionToUpdate = await ask(`Optional, Update package version in package.json. (Current version: ${pkgJson.version as string}) Don't prefix 'v': `)

  if (packageVersionToUpdate) {
    // Check if input is valid version
    if (!/(\d\.){2}\d/.test(packageVersionToUpdate))
      error(`Entered version: ${packageVersionToUpdate} doesn't match the pattern. e.g. 0.0.0`)

    // Loop over all package.json files and update version
    pkgJsonPaths.forEach((pkgJsonPath) => {
      const pkgJson = fs.readJSONSync(pkgJsonPath)
      pkgJson.version = packageVersionToUpdate

      fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 })
    })
  }
  else {
    info('Ignoring version update!')
  }
}
