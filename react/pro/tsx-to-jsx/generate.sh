# Compile Typescript files to React JS files in a new directory javascript-version in the new folder
tsc --project ../../configs/tsconfig.json

# Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder javascript-version
cp ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/package.json ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/next.config.js ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/next-env.d.ts ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/.gitignore ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/.prettierrc.js ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/.editorconfig ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/.env.development ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/.npmrc ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/.nvmrc ../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version/

# Copy .vscode & public directories into javascript-version for assets and .vscode configurations
cp -r  ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/public ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version/styles ../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version/

# Remove Typescript from the javascript-version
node create-jsconfig.js

# Remove Typescript from the javascript-version
node remove-ts.js

# Create .eslint in javascript-version
node update-eslint.js

cd ../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version

# install node_modules
yarn install

# Add javascript version specific eslint plugins
yarn add babel-eslint @babel/core @babel/eslint-parser 

# Run yarn format command to format all the files using prettier
yarn format

# Run yarn lint command to fix all the linting error and give space after imports
yarn lint

# Run yarn format command to format all the files using prettier
yarn format

# Copy SourceCode
cd ../../../automation-scripts/react/pro/copy-source
node copySourceTSX.js
node copySourceJSX.js

# Generate DemoConfigs
cd ../demo-generation
node generate-demo-configs.js

# Format typescript-version
cd ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version
yarn format