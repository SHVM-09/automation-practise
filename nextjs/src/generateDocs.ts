import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import fs from 'fs-extra'
import path from 'path'
import type { TemplateRepoName } from './configs/getPaths'
import getTemplateName from './utils/getTemplateName'
import { getTemplateRepoPaths } from './configs/getPaths'
import { execCmd } from './utils/node'
import { updateDocusaurusConfig } from './docs/updateDocusaurusConfig'
import { changesAccordingToMarketplace } from './docs/changesAccordingToMarketplace'

const generateDocs = defineCommand({
  meta: {
    name: 'generate-docs'
  },
  args: {
    templateName: {
      type: 'string',
      description: 'template name',
      required: false
    },
    isMarketplace: {
      type: 'boolean',
      description: 'is this a marketplace generation?',
      required: false,
      alias: 'm'
    },
    isProduction: {
      type: 'boolean',
      description: 'is this a production?',
      required: false,
      alias: 'p'
    }
  },
  async run ({ args }) {
    // Vars
    const templateName: TemplateRepoName = (args.templateName ?? await getTemplateName()) as TemplateRepoName
    let isMarketplace = args.isMarketplace
    let isProduction = args.isProduction

    if (isMarketplace === undefined && args.templateName === undefined && (templateName === 'materio' || templateName === 'sneat')) {
      isMarketplace = await consola.prompt('Is this a marketplace package?', { type: 'confirm', initial: false })
    } else if (isMarketplace && (templateName === 'materio' || templateName === 'sneat')) {
      isMarketplace = true
    } else {
      isMarketplace = false
    }

    if (isProduction === undefined && args.templateName === undefined) {
      isProduction = await consola.prompt('Is this a production?', { type: 'confirm', initial: false })
    }

    const templateDir = getTemplateRepoPaths[templateName]
    const docsDir = path.join(templateDir, 'docs')

    // ────────────── Remove Unwanted Files ──────────────
    consola.start('Removing Unwanted Files...')
    await fs.remove(path.join(docsDir, 'docs/assets/1.jpg'))
    await fs.remove(path.join(docsDir, 'docs/guide/tags.mdx'))
    await fs.remove(path.join(docsDir, 'docs/user-interface/components/test.mdx'))
    await fs.remove(path.join(docsDir, 'docs/user-interface/form-elements/test.mdx'))
    await fs.remove(path.join(docsDir, '.docusaurus'))
    await fs.remove(path.join(docsDir, 'build'))
    await fs.remove(path.join(docsDir, 'documentation'))
    await fs.remove(path.join(docsDir, 'documentation.zip'))
    consola.success('Removed Unwanted Files successfully!\n')

    // ────────────── Update Sidebars file ──────────────
    consola.start('Updating sidebars.ts file...')
    const sidebarPath = path.join(docsDir, 'sidebars.ts')
    let sidebarContent = await fs.readFile(sidebarPath, 'utf8')

    sidebarContent = sidebarContent
      .replace(/\n\s*'guide\/tags',/g, '')
      .replace(/,\n\s*'user-interface\/components\/test'/g, '')
      .replace(/,\n\s*'user-interface\/form-elements\/test'/g, '')

    await fs.writeFile(sidebarPath, sidebarContent)
    consola.success('Updated sidebars.ts file successfully!\n')

    // ────────────── Update docusaurus.config.js file ──────────────
    // params: directory, templateName, isProduction
    await updateDocusaurusConfig(docsDir, templateName, isProduction)

    // ────────────── Update files according to marketplace ──────────────
    if (isMarketplace) {
      await changesAccordingToMarketplace(docsDir)
    }

    // ────────────── Create Build ──────────────
    consola.start('Creating Build...')
    await execCmd('pnpm build', { cwd: docsDir })
    consola.success('Created Build successfully!\n')

    // ────────────── Rename Build Folder ──────────────
    consola.start('Renaming Build Folder to Documentation...')
    await fs.move(path.join(docsDir, 'build'), path.join(docsDir, 'documentation'))
    consola.success('Renamed Build Folder to Documentation successfully!\n')

    // ────────────── Zip Documentation Folder ──────────────
    // consola.start('Zipping Documentation Folder...')
    // await execCmd('zip -r documentation.zip documentation -x "*.DS_Store" -x "__MACOSX"', { cwd: docsDir })
    // consola.success('Zipped Documentation Folder successfully!\n')
  }
})

runMain(generateDocs)
