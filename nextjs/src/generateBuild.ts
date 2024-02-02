import { consola } from 'consola';
import { promisify } from 'util';
import path from 'path';
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
    
    if (!process.env.CI)
      config({ path: path.join(tsFullDir, '.env') })
  
    // ────────────── Before Build ──────────────
    await beforeBuild(tsFullDir, args.marketplace);
  
    // ────────────── Build ──────────────
    try {
      await exec(`vercel build ${args.prod ? '--prod ' : ''}--yes --token=${process.env.VERCEL_TOKEN}`, { cwd: path.join(tsFullDir, '..', '..') });
    } catch (error) {
      consola.error(`An error occurred while building: ${error}`);
      consola.error(`stdout: ${String((error as any).stderr)}`);
      process.exit(1);
    }
  
    // ────────────── After Build ──────────────
    await afterBuild(tsFullDir);
  }
});

runMain(main);
