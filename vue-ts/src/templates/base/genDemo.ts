import path from 'path'
import fs from 'fs-extra'

export class GenDemo {
  constructor(private projectPath: string) {
    // Modify build command
  }

  updateBuildCommand() {
    // Path to package json file
    const pkgJSONPath = path.join(this.projectPath, 'package.json')

    // Read package json file as plain text => It's easy to find & replace
    let pkgJSON = fs.readFileSync(pkgJSONPath, { encoding: 'utf-8' })

    // Find and remove `vue-tsc --noEmit` usage
    pkgJSON = pkgJSON.replace(/&& vue-tsc --noEmit /g, '')

    // Write back to file
    fs.writeFileSync(pkgJSONPath, pkgJSON, { encoding: 'utf-8' })
  }

  generate() {
    // Get settings

    // Loop over modification
  }
}
