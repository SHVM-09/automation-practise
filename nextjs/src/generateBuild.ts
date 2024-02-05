import { consola } from 'consola';
import { promisify } from 'util';
import path, { basename } from 'path';
import { exec as execCallback } from "child_process";
import beforeBuild from './build/beforeBuild';
import afterBuild from './build/afterBuild';
import { getTsVersionPath } from './utils/templatePathUtils';
import { config } from 'dotenv'
import { defineCommand, runMain } from "citty";

// Promisify exec
const exec = promisify(execCallback);


const main = defineCommand({
  meta: {
    name: "generateBuild",
  },
  args: {
    templateName: {
      type: "positional",
      description: "template name",
      required: true,
    },
    marketplace: {
      alias: 'm',
      type: 'boolean',
      description: 'Run script for MUI marketplace',
      default: false,
    },
    prod: {
      type: 'boolean',
      description: 'Run script in prod',
      default: false,
    },
    'vercel-token': {
      type: 'string',
      description: 'Vercel token for login',
      required: true,
    },
  },
  async run({ args }) {
    // Vars
    const templateName = args.templateName;
    const templateFullVersion = 'full-version';
    
    if (!templateName) {
      consola.error("Template repo does not exist.");
      return;
    }
    
    const tsFullDir = process.env.CI ? `../../${templateName}/nextjs/typescript-version/full-version` : getTsVersionPath(templateName, templateFullVersion);
    
    // if (!process.env.CI)
    try {
      // INFO: We'll use production env variables even in staging
      consola.log(await exec(`vercel env pull --yes --environment=production --token=${args['vercel-token']}`, { cwd: tsFullDir }));
      consola.log(await exec(`ls -la`, { cwd: tsFullDir }));
      consola.log(await exec(`ls -la`));
    } catch (error) {
      consola.error(`An error occurred while building: ${error}`);
      consola.error(`stdout: ${String((error as any).stderr)}`);
      process.exit(1);
    }
    
    const env = config({ path: path.join(tsFullDir, '.env.production.local') })

    console.log('env :>> ', env);
    console.log('env.parsed :>> ', env.parsed);
    console.log('env.parsed.BASEPATH :>> ', env.parsed?.BASEPATH);
    const basePath = '/materio-mui-nextjs-admin-template/demo-1'
    console.log('basePath :>> ', basePath);
  
    // ────────────── Before Build ──────────────
    await beforeBuild(tsFullDir, basePath ?? '', args.marketplace);
  
    // ────────────── Build ──────────────
    try {
      await exec(`vercel build --yes --token=${args['vercel-token']} ${args.prod ? '--prod' : ''}`, { cwd: path.join(tsFullDir, '..', '..') });
    } catch (error) {
      consola.error(`An error occurred while building: ${error}`);
      consola.error(`stdout: ${String((error as any).stderr)}`);
      process.exit(1);
    }
  
    // ────────────── After Build ──────────────
    await afterBuild(tsFullDir, basePath ?? '');
  }
});

runMain(main);
