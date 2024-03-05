import { execCmd } from './node'

export const genProjectCopyCommand = (src: string, dest: string, ignorePatterns: string[]): string => {
  let command = `rsync -av --progress ${src}/ ${dest} `

  ignorePatterns.forEach(pattern => {
    // We need to escape the * when using rsync
    command += ` --exclude ${pattern.replace('*', '\\*')}`
  })

  return command
}

export const copyDirectory = async (src: string, dest: string, ignorePatterns: string[] = []): Promise<void> => {
  const commandToCopyProject = genProjectCopyCommand(src, dest, ignorePatterns)

  await execCmd(commandToCopyProject)
}
