import { TemplateBaseConfig } from '@/templates/base';
import { getTemplatePath } from '@/utils/paths';
import { path } from 'zx';

interface MaterioConfig extends TemplateBaseConfig {}

export const config: MaterioConfig = {
  templateName: 'Materio',
  projectPath: path.join(getTemplatePath('materio', 'vue')),
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
