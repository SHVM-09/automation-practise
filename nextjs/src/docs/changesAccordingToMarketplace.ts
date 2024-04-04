import consola from 'consola'
import fs from 'fs-extra'
import path from 'path'
import { globbySync } from 'globby'

export const changesAccordingToMarketplace = async (directory: string) => {
  consola.start('Updating files according to marketplace...')

  // ────────────── Update docusaurus.config.ts file ──────────────
  const docusaurusConfigPath = path.join(directory, 'docusaurus.config.ts')
  let docusaurusConfigContent = await fs.readFile(docusaurusConfigPath, 'utf8')

  docusaurusConfigContent = docusaurusConfigContent
    .replace(/(?<=\sbaseUrl:\s')(.*)(?=',)/g, '/marketplace$1')
    .replace(/(?<=demos.themeselection.com)(.*)(?=\/demo-1',)/g, '/marketplace$1')
    .replaceAll("'https://themeselection.com'", "'https://mui.com/store/contributors/themeselection'")
    .replace(
      'https://themeselection.com/item/materio-mui-nextjs-admin-template',
      'https://mui.com/store/items/materio-mui-react-nextjs-admin-template'
    )
    .replace('https://themeselection.com/license', 'https://mui.com/store/license')
  await fs.writeFile(docusaurusConfigPath, docusaurusConfigContent)

  // ────────────── Update Files in docs and src folders ──────────────
  const files = globbySync(['src/**/*.{ts,tsx,md,mdx,scss}', 'docs/**/*.{ts,tsx,md,mdx,scss}'], {
    cwd: directory,
    absolute: true
  })

  for (const file of files) {
    let content = await fs.readFile(file, 'utf8')

    content = content
      .replaceAll(
        'https://demos.themeselection.com/materio-mui-nextjs-admin-template/demo-1',
        'https://demos.themeselection.com/marketplace/materio-mui-nextjs-admin-template/demo-1'
      )
      .replace(
        'https://themeselection.com/item/materio-mui-nextjs-admin-template',
        'https://mui.com/store/items/materio-mui-react-nextjs-admin-template'
      )
      .replace(
        'https://demos.themeselection.com/materio-mui-react-nextjs-admin-template-old/documentation',
        'https://demos.themeselection.com/marketplace/materio-mui-react-nextjs-admin-template/documentation'
      )

    await fs.writeFile(file, content)
  }

  consola.success('Updated files according to marketplace successfully!\n')
}
