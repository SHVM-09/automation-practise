import { TempLocation } from '@/utils/temp';
import path from 'path';
import { TemplateBaseConfig } from './config';

export class GenJS {
  private projectSrcPath: string
  private tempDir: string

  constructor(private templateConfig: TemplateBaseConfig) {
    this.projectSrcPath = path.join(templateConfig.projectPath, 'src')
    this.tempDir = new TempLocation().tempDir
  }

  private genProjectCopyCommand(): string {
    let command = `rsync -av --progress ${this.templateConfig.projectPath} ${this.tempDir} `
    this.templateConfig.packageCopyIgnorePatterns.forEach(pattern => {
      
      // We need to escape the * when using rsync
      command += `--exclude ${pattern.replace('*', '\\*')} `
    })

    return command
  }

  private async copyProjectToTempDir() {
    console.log(`Copying to ${this.tempDir}`);

    const commandToCopyProject = this.genProjectCopyCommand()

    console.log('commandToCopyProject :>> ', commandToCopyProject);
  }

  genJS() {
    // Copy project to temp dir
    this.copyProjectToTempDir()
  }
}
