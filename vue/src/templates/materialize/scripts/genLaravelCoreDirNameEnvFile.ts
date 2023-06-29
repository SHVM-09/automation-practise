import parseArgs from 'minimist'
import { config } from '../config'
import { writeFileSyncUTF8 } from '@/utils/node'

const argv = parseArgs(process.argv.slice(2))

const isStaging = !!argv.staging

const zipFileName = '.env.laravel-core-dir-name'
const fileContent = `LARAVEL_CORE_DIR_NAME=${config.laravel.pkgName}${isStaging ? '-staging' : ''}`

writeFileSyncUTF8(zipFileName, fileContent)

console.log(`Generated \`${zipFileName}\` file with content: "${fileContent}"`)
