import path from 'path'
import consola from 'consola'
import fs from 'fs-extra'
import { execCmd } from './node'

/**
 * Removes the Buy Now button from the specified directory.
 * @param directory The directory path where the Buy Now button should be removed.
 * @param buyNowDir The directory path of the Buy Now button inside the specified `directory`.
 * @param layoutDir The directory path of the layout file inside the specified `directory` from where the Buy Now button's import and component should be removed.
 */
export const removeBuyNowButton = async (directory: string, buyNowDir: string, layoutDir: string): Promise<void> => {
  consola.start(`Removing Buy Now button from ${directory} directory...`)

  const buyNowPath = path.join(directory, buyNowDir)
  const layoutPath = path.join(directory, layoutDir)
  let content = await fs.readFile(layoutPath, 'utf8')

  // Remove buy-now folder
  await execCmd(`rm -rf ${buyNowPath}`)

  // Remove buy-now import
  content = content.replace(/import BuyNowButton from '@components\/buy-now-button'\n/g, '')

  // Remove buy-now component
  content = content.replace(/<BuyNowButton \/>\n/g, '')

  // Write layout file
  await fs.writeFile(layoutPath, content, 'utf8')

  consola.success(`Removed Buy Now button successfully from ${directory} directory!\n`)
}
