import { getCommand } from '@/utils/cli';
import { getTemplatePath } from '@/utils/paths';
import { argv, path } from 'zx';
import { config } from './config';
import { Master } from './template';

const masterRepoPath = getTemplatePath('master');
const masterVersionsPaths = {
  tSFull: path.join(masterRepoPath, 'typescript-version', 'full-version'),
  tSStarter: path.join(masterRepoPath, 'typescript-version', 'starter-kit'),
  jSFull: path.join(masterRepoPath, 'javascript-version', 'full-version'),
  jSStarter: path.join(masterRepoPath, 'javascript-version', 'starter-kit'),
}
const masterSrcPaths = Object.entries(masterVersionsPaths).map(([v, _path]) => ({ [v]: path.join(_path, 'src') }))

const m = new Master(config)

// console.log('argv :>> ', argv);

const command = getCommand(argv)

console.log('masterSrcPaths :>> ', masterSrcPaths);
// if (command === 'fillSnippets') {
//   m.fillSnippets.fillSnippetFromSource(masterRepoPath)
// }
