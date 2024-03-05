import path from 'path'
import consola from 'consola'
import { copyDirectories } from '@/utils/fsUtils'

const createSkPages = async (tsSkDir: string) => {
  consola.info('Creating sk-pages...')

  const dashboardDir = path.join(tsSkDir, 'src/app/(dashboard)')

  // Convert relative paths to absolute path
  const skPagesPath = path.resolve('src/starter-kit/sk-pages')

  // Copy sk-pages to dashboard
  await copyDirectories(['home', 'about'], skPagesPath, dashboardDir)

  consola.success('sk-pages created.')
}

export default createSkPages
