import { defineCommand, runMain } from 'citty'
import { config } from '../config'
import { writeFileSyncUTF8 } from '@/utils/node'

const main = defineCommand({
  meta: {
    name: 'genLaravelCoreDirNameEnvFile.ts',
    description: 'Generate .env file to inject environment variables in github action workflow',
  },
  args: {
    staging: {
      type: 'boolean',
      description: 'Generate .env file content for staging environment',
      default: false,
    },
  },
  run({ args }) {
    const fileName = '.env.laravel-core-dir-name'
    const fileContent = `LARAVEL_CORE_DIR_NAME=${config.laravel.pkgName}${args.staging ? '-staging' : ''}`

    writeFileSyncUTF8(fileName, fileContent)

    console.log(`Generated \`${fileName}\` file with content: "${fileContent}"`)
  },
})

await runMain(main)
