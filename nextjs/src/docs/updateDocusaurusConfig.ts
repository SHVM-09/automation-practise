import consola from 'consola'
import fs from 'fs-extra'
import path from 'path'
import type { TemplateRepoName } from '@/configs/getPaths'
import { templateConfig } from '@configs/templateConfig'

export const updateDocusaurusConfig = async (
  directory: string,
  templateName: TemplateRepoName,
  isProduction: boolean
) => {
  consola.start('Updating docusaurus.config.ts file...')

  const docusaurusConfigPath = path.join(directory, 'docusaurus.config.ts')
  let docusaurusConfigContent = await fs.readFile(docusaurusConfigPath, 'utf8')

  const baseUrl = isProduction
    ? templateConfig[templateName]?.docsBaseUrl
    : templateConfig[templateName]?.docsStagingBaseUrl

  docusaurusConfigContent = docusaurusConfigContent.replace(/(?<=\sbaseUrl:\s')(.*)(?=',)/g, baseUrl)

  await fs.writeFile(docusaurusConfigPath, docusaurusConfigContent)

  consola.success('Updated docusaurus.config.ts file successfully!\n')
}
