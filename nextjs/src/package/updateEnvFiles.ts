import path from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import type { TemplateRepoName } from '../configs/getPaths'
import { templateConfig } from '../configs/templateConfig'

export const updateEnvFiles = async (
  templateName: TemplateRepoName,
  templateDir: string
): Promise<void> => {
  consola.start(`Updating env files in ${templateDir}...`)

  // Vars
  const envPath = path.join(templateDir, '.env')
  const envExamplePath = path.join(templateDir, '.env.example')
  const docsURL = templateConfig[templateName]?.links.docs

  // Read .env file
  let envContent = await fs.readFile(envPath, 'utf8')

  // Replace .env variables
  envContent = envContent.replace(/NEXT_PUBLIC_DOCS_URL=.*/g, `NEXT_PUBLIC_DOCS_URL=${docsURL}`)
  envContent = envContent.replace(/GOOGLE_CLIENT_ID=.*/g, 'GOOGLE_CLIENT_ID=')
  envContent = envContent.replace(/GOOGLE_CLIENT_SECRET=.*/g, 'GOOGLE_CLIENT_SECRET=')

  // Write .env file
  await fs.writeFile(envPath, envContent, 'utf8')

  // Read .env.example file
  let envExampleContent = await fs.readFile(envExamplePath, 'utf8')

  // Replace .env.example variables
  envExampleContent = envExampleContent.replace(/NEXT_PUBLIC_DOCS_URL=.*/g, `NEXT_PUBLIC_DOCS_URL=${docsURL}`)

  // Write .env.example file
  await fs.writeFile(envExamplePath, envExampleContent, 'utf8')

  consola.success(`Updated env files successfully in ${templateDir}!\n`)
}
