import * as url from 'url';
import { path } from 'zx';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// projectRoot => automation-scripts/vue
export const projectPath = path.join(__dirname, '../../')

// repoRoot => automation-scripts
export const repoPath = path.join(projectPath, '../')

export const getTemplatePath = (name: string, technology: string) => path.join(repoPath, `../${name}`, technology)
