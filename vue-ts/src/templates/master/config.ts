import { TemplateBaseConfig } from '@/templates/base';
import { getTemplatePath } from '@/utils/paths';
import { path } from 'zx';

interface MasterConfig extends TemplateBaseConfig {}

export const config: MasterConfig = {
  templateName: 'Master',
  projectPath: path.join(getTemplatePath('master', 'vue')),
  packageIgnorePatterns: [
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
}
