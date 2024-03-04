import path from 'path'
import * as url from 'url'

export type MasterRepoName = 'main-master' | 'mui-master' | 'mui-master-free'
export type TemplateRepoName = 'materio' | 'materio-free' | 'sneat' | 'sneat-free' | 'vuexy' | 'materialize'

export type MasterRepoPaths = Record<MasterRepoName, string>
export type TemplateRepoPaths = Record<TemplateRepoName, string>

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export const getMasterRepoPaths: MasterRepoPaths = {
  'main-master': path.join(__dirname, '../../../../master-nextjs-framework-independent'), // Path to main-master repo that is framework independent
  'mui-master': path.join(__dirname, '../../../../master-mui-nextjs'), // Path to mui-master repo
  'mui-master-free': path.join(__dirname, '../../../../master-mui-nextjs-free') // Path to mui-master-free repo

  // 'chakra-master': path.join(__dirname, '../../../../master-chakra-nextjs'), // Path to chakra-master repo
  // 'shadcn-master': path.join(__dirname, '../../../../master-shadcn-nextjs'), // Path to shadcn-master repo
}

export const getTemplateRepoPaths: TemplateRepoPaths = {
  materio: path.join(__dirname, '../../../../materio/materio-mui-nextjs-admin-template'), // Path to materio template repo
  'materio-free': path.join(__dirname, '../../../../materio/materio-nextjs-free'), // Path to materio-free template repo
  sneat: path.join(__dirname, '../../../../sneat/sneat-nextjs'), // Path to sneat template repo
  'sneat-free': path.join(__dirname, '../../../../sneat/sneat-nextjs-free'), // Path to sneat-free template repo
  vuexy: path.join(__dirname, '../../../../vuexy/vuexy-nextjs'), // Path to vuexy template repo
  materialize: path.join(__dirname, '../../../../materialize/materialize-nextjs') // Path to materialize template repo
}
