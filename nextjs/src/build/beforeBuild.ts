import { getUrls } from '@/configs/getUrls';
import { readFileSync, writeFileSync } from 'fs';
import fs from 'fs/promises';
import { globbySync } from 'globby';
import path from 'node:path';

/**
 * Append base path to image references in TypeScript API files.
 */
async function prependBasePathToImages(tsFullDir: string, basePath: string): Promise<void> {
  if (!basePath) {
    console.log('No basePath found in `process.env.BASEPATH`, skipping...');
    return;
  }

  const apiFiles = globbySync(['src/app/api/**/*.ts'], {
    cwd: tsFullDir,
    absolute: true,
    gitignore: false,
    dot: true
  });

  await Promise.all(apiFiles.map(async (file: string): Promise<void> => {
    let content = await fs.readFile(file, 'utf-8');
    content = content.replace(/\/images\//g, `${basePath}/images/`);
    await fs.writeFile(file, content);
  }));
}

/**
 * Remove Google Sign-In from Login component.
 */
function removeGoogleSignInFromLogin(tsFullDir: string): void {
  const loginFilePath = path.join(tsFullDir, 'src/views/Login.tsx');
  let content = readFileSync(loginFilePath, 'utf-8');
  content = content.replace(/<Divider.*?<\/Button>/gms, '').replace(/import Divider.*/g, '');
  writeFileSync(loginFilePath, content, 'utf-8');
}

/**
 * Remove Icon Test feature from project files.
 */
async function removeIconTestFeature(tsFullDir: string): Promise<void> {
  const searchDataFilePath = path.join(tsFullDir, 'src/data/searchData.ts');
  let content = readFileSync(searchDataFilePath, 'utf-8');
  content = content.replace(/(?<=id: '41'.*){.*icons-test.*?},.*?(?={)/gms, '');
  writeFileSync(searchDataFilePath, content, 'utf-8');

  const filesToRemove = [
    'src/views/icons-test',
    'src/app/api/icons-test',
    'src/app/[lang]/(dashboard)/icons-test'
  ].map(subPath => path.join(tsFullDir, subPath));

  await Promise.all(filesToRemove.map(async (filePath) => {
    await fs.rm(filePath, { recursive: true, force: true });
  }));

  const menuFilePaths = [
    'src/components/layout/horizontal/HorizontalMenu.tsx',
    'src/components/layout/vertical/VerticalMenu.tsx'
  ].map(subPath => path.join(tsFullDir, subPath));

  await Promise.all(menuFilePaths.map(async (filePath) => {
    let menuContent = readFileSync(filePath, 'utf-8');
    menuContent = menuContent.replace(/<MenuItem.*[\n\s]+Icons Test[\n\s]+<\/MenuItem>[\n\s]+/gm, '');
    writeFileSync(filePath, menuContent, 'utf-8');
  }));

  const navLinksFiles = [
    'src/data/navigation/horizontalMenuData.tsx',
    'src/data/navigation/verticalMenuData.tsx'
  ].map(subPath => path.join(tsFullDir, subPath));

  await Promise.all(navLinksFiles.map(async (filePath) => {
    let navContent = readFileSync(filePath, 'utf-8');
    navContent = navContent.replace(/[\n\s]+{[\s\n]+label: 'Icons Test',.*?}/gms, '');
    writeFileSync(filePath, navContent, 'utf-8');
  }));
}

/**
 * Update Next.js configuration with custom headers.
 */
function updateNextJsConfigWithHeaders(tsFullDir: string): void { 
  const nextConfigFilePath = path.join(tsFullDir, 'next.config.js');
  let configContent = readFileSync(nextConfigFilePath, 'utf-8');

  const headersConfig = `
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "https://demos.themeselection.com" },
            { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
          ]
        }
      ]
    },
  `;

  configContent = configContent.replace(/( +)(reactStrictMode: false)/gms, `$1$2,\n$1${headersConfig}`);
  writeFileSync(nextConfigFilePath, configContent, 'utf-8');
}

async function updateUrlsForMarketplace(tsFullDir: string): Promise<void> {
  const files = globbySync([
    'src/components/layout/vertical/FooterContent.tsx',
    'src/components/layout/horizontal/FooterContent.tsx',
    'src/components/layout/vertical/VerticalMenu.tsx',
    'src/components/layout/horizontal/HorizontalMenu.tsx',
    'src/data/navigation/horizontalMenuData.tsx',
    'src/data/navigation/verticalMenuData.tsx',
    'src/components/buy-now-button/index.tsx'
  ], {
    cwd: tsFullDir,
    absolute: true,
    gitignore: false,
    dot: true
  });

  await Promise.all(files.map(async (file: string): Promise<void> => {
    let content = await fs.readFile(file, 'utf-8');
    
    // Loop through all URLs
    const urls = getUrls('materio');

    for (const url of Object.keys(urls)) {
      const urlWithoutTrailingSlash = url.replace(/\/$/, '');
      const regex = new RegExp(`('|")${urlWithoutTrailingSlash}\\/?('|")`, 'g');
      content = content.replace(regex, `$1${urls[url]}$2`);
    }

    await fs.writeFile(file, content);
  }));
}

// TODO: Feel free to improve this because this is written in hurry
const updateModeStorageKey = async (tsFullDir: string) => {
  const themeProviderPath = path.join(tsFullDir, 'src', 'components', 'theme', 'index.tsx');
  let content = await fs.readFile(themeProviderPath, 'utf-8');

  content = content
    // Add type
    .replace(
      " } from '@core/types'",
      ", DemoName } from '@core/types'"
     )
    // Add prop
    .replace(
      "systemMode: SystemMode",
      "systemMode: SystemMode\n  demoName: DemoName",
    )
    // Add replace
    .replace(
      "mui-template-mode`",
      "mui-template-mode`.replace(props.demoName ? 'demo-1' : '', props.demoName || '')"
  )

  // Write back to file
  await fs.writeFile(themeProviderPath, content);

  const providersPath = path.join(tsFullDir, 'src', 'components', 'Providers.tsx');
  let providerContent = await fs.readFile(providersPath, 'utf-8');
  providerContent = providerContent.replace(
    "<ThemeProvider direction={direction} systemMode={systemMode}>",
    "<ThemeProvider direction={direction} systemMode={systemMode} demoName={demoName}>"
  )

  await fs.writeFile(providersPath, providerContent);
}

async function beforeBuild(tsFullDir: string, basePath: string, isMarketplaceBuild: boolean): Promise<void> {
  // Update URLs
  if (isMarketplaceBuild)
    await updateUrlsForMarketplace(tsFullDir);

  // Append base path to image references in TypeScript API files
  await prependBasePathToImages(tsFullDir, basePath);

  // Remove Google Sign-In from Login component
  await removeGoogleSignInFromLogin(tsFullDir);

  // Remove Icon Test feature from project files
  await removeIconTestFeature(tsFullDir);

  // Update Next.js configuration with custom headers
  await updateNextJsConfigWithHeaders(tsFullDir);

  await updateModeStorageKey(tsFullDir);
}

export default beforeBuild;
