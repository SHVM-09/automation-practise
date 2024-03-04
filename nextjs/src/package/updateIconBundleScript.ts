import fs from 'fs-extra'

export const updateIconBundleScript = async (filePath: string): Promise<void> => {
  let content = await fs.readFile(filePath, 'utf8')

  content = content.replace(
    /(?<=const sources.*?\n\s{2})(icons:.*?],)/s,
    '/* $1 */'
  )
  content = content.replace(
    /\s(Custom file with only few icons\s)*({\s*[^{}]*?icons:[^{}]*?})(\s*)/g,
    '$1 /* $2 */$3'
  )

  await fs.writeFile(filePath, content, 'utf8')
}
