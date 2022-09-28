import { TemplateBaseConfig } from '@/templates/base';
import { getTemplatePath } from '@/utils/paths';
import path from 'path';

interface MasterConfig extends TemplateBaseConfig {}

const projectPath = path.join(getTemplatePath('master', 'vue'));
export const config: MasterConfig = {
  templateName: 'Master',
  projectPath: projectPath,
  packageCopyIgnorePatterns: [
        // Directories
        "dist",
        "docs",
        "scripts",
        ".git",
        ".github",
        "node_modules",

        // Files
        "LICENSE.md",
        "license.md",
        "*.log",
        "*.zip",
  ],
  paths: {
    tSFull: path.join(projectPath, 'typescript-version', 'full-version'),
    tSStarter: path.join(projectPath, 'typescript-version', 'starter-kit'),
    jSFull: path.join(projectPath, 'javascript-version', 'full-version'),
    jSStarter: path.join(projectPath, 'javascript-version', 'starter-kit'),
  }
}
