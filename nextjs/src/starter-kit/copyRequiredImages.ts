import path from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import { getImagePaths } from '@configs/getImages'

const copyRequiredImages = async (templateName: string, tsFullDir: string, tsSkDir: string) => {
  consola.info('Copying required images...')

  const requiredImages = await getImagePaths(templateName)

  // Copy required images
  for (const image of requiredImages) {
    const imageSrc = path.join(tsFullDir, image)
    const imageDest = path.join(tsSkDir, image)

    // Ensure that the directory exists for each image
    const dir = path.dirname(imageDest)

    await fs.ensureDir(dir)

    try {
      await fs.copyFile(imageSrc, imageDest)
    } catch (error) {
      consola.error(`An error occurred while copying ${image}: ${error}`)
    }
  }

  consola.success('All required images copied successfully.')
}

export default copyRequiredImages
