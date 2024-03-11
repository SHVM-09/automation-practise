import { consola } from 'consola'
import { folderExist } from '@/utils/fsUtils'
import { getTemplateRepoPaths } from '@/configs/getPaths'

/**
 * Prompt the user to select a template version and verify the corresponding paths.
 * @param templateName - The name of the template for which the version is being selected.
 * @returns The selected template version.
 */
async function getTemplateVersion(templateName: string): Promise<undefined | string> {
  // Prompt the user to select a template version
  const version = (await consola.prompt('Select Template Version', {
    type: 'select',
    options: [
      { label: 'Full Version', value: 'full-version', hint: 'Full version of the template' },
      { label: 'Starter Kit', value: 'starter-kit', hint: 'Starter kit of the template' },
      { label: 'Both', value: 'both', hint: 'Both Full version and Starter Kit of the template' }
    ]
  })) as unknown as string

  const templatePath = getTemplateRepoPaths[templateName]

  // Logic to verify the selected version path
  if (version === 'both') {
    // Verify full version path
    consola.start('Verifying Full Version path...')

    if (!folderExist(`${templatePath}/typescript-version/full-version`)) {
      consola.error('Full Version does not exist.')

      return
    } else {
      consola.success('Full Version path verified!')
    }

    // Verify starter kit path
    consola.start('Verifying Starter kit path...')

    if (!folderExist(`${templatePath}/typescript-version/starter-kit`)) {
      consola.error('Starter kit does not exist.')

      return
    } else {
      consola.success('Starter kit path verified!')
    }
  } else {
    // Verify the path for the selected version
    consola.start('Verifying selected version path...')

    if (!folderExist(`${templatePath}/typescript-version/${version}`)) {
      consola.error(`${version} does not exist.`)

      return
    } else {
      consola.success('Selected version path verified!')
    }
  }

  return version
}

export default getTemplateVersion
