import { execCmd } from '@/utils/node'
import { TempLocation } from '@/utils/temp'

export class Utils {
  protected tempDir: string

  constructor() {
    this.tempDir = new TempLocation().tempDir
  }

  private genProjectCopyCommand(src: string, dest: string, ignorePatterns: string[]): string {
    let command = `rsync -av --progress ${src}/ ${dest} `
    ignorePatterns.forEach((pattern) => {
      // We need to escape the * when using rsync
      command += `--exclude ${pattern.replace('*', '\\*')} `
    })

    return command
  }

  protected copyProject(src: string, dest: string, ignorePatterns: string[]) {
    const commandToCopyProject = this.genProjectCopyCommand(src, dest, ignorePatterns)

    execCmd(commandToCopyProject)
  }
}
