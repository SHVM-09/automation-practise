import path from 'path'
import fs from 'fs-extra'
import type { TemplateConfig } from '../configs/templateConfig'

const changelogFileContent = (config: TemplateConfig): string => {
  return `<!DOCTYPE html>
<html>

<head>
  <title>${config.fullName}</title>
  <meta http-equiv="refresh"
    content="0; URL='${config.links.changelog}'" />
</head>

<body>
  <p>If you do not redirect please visit : <a href="${config.links.changelog}">${config.links.changelog}</a></p>
</body>

</html>
`
}

export const addChangelogFile = async (directory: string, config: TemplateConfig): Promise<void> => {
  await fs.writeFile(path.join(directory, 'changelog.html'), changelogFileContent(config))
}
