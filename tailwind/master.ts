import * as fs from 'fs-extra';
import * as path from 'path';

interface CopyConfig {
    source: string;
    destination: string;
}

const initPath = '../../';

const masterDaisy = `${initPath}master-daisyui`;
const masterPreline = `${initPath}master-preline`;
const destination = `${initPath}sneat-tailwindcss`;

const sourcePaths: CopyConfig[] = [
    { source: path.join(masterDaisy, 'src'), destination: path.join(destination, 'src') },
    { source: path.join(masterPreline, 'src'), destination: path.join(destination, 'src', 'js') },
    { source: path.join(masterPreline, 'node-scripts'), destination: path.join(destination, 'src', 'node-scripts') },
    { source: path.join(masterPreline, 'plugin.js'), destination: path.join(destination,'src', 'plugin.js') },
    { source: path.join(masterPreline, 'webpack.config.js'), destination: path.join(destination, 'webpack.config.js') },
    { source: path.join(masterPreline, 'tsconfig.json'), destination: path.join(destination, 'tsconfig.json') }
];

async function copyFolders(paths: CopyConfig[]): Promise<void> {
    try {
        for (const { source, destination } of paths) {
            console.log(`Copying folder from ${source} to ${destination}`);
            await fs.copy(source, destination, { overwrite: true,
              filter: (src: string) => {
                // Exclude .prettierignore and .prettierrc.yaml files
                const fileName = path.basename(src);
                return !['.prettierignore', '.prettierrc.yaml'].includes(fileName);
            }, });
            console.log(`Folder copied successfully from ${source} to ${destination}`);
        }
        console.log('Files copied successfully!');
    } catch (error) {
        console.error('An error occurred while copying folders:', error);
    }
}


async function main() {
    await copyFolders(sourcePaths);
}

main().catch(error => {
    console.error('An error occurred during script execution:', error);
});
