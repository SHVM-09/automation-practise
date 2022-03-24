# Compile Typescript files to React JS files in a new directory javascript-version in the new folder
tsc --project ../../../../master-react-mui-nextjs/typescript-version/full-version/tsconfig.jsx.json

# Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder javascript-version
cp ../../../../master-react-mui-nextjs/typescript-version/full-version/package.json ../../../../master-react-mui-nextjs/typescript-version/full-version/next.config.js ../../../../master-react-mui-nextjs/typescript-version/full-version/next-env.d.ts ../../../../master-react-mui-nextjs/typescript-version/full-version/.gitignore ../../../../master-react-mui-nextjs/typescript-version/full-version/.prettierrc.js ../../../../master-react-mui-nextjs/typescript-version/full-version/.editorconfig ../../../../master-react-mui-nextjs/typescript-version/full-version/.env ../../../../master-react-mui-nextjs/javascript-version/full-version/

# Copy .vscode & public directories into javascript-version for assets and .vscode configurations
cp -r  ../../../../master-react-mui-nextjs/typescript-version/full-version/public ../../../../master-react-mui-nextjs/typescript-version/full-version/styles ../../../../master-react-mui-nextjs/javascript-version/full-version/

# Remove Typescript from the javascript-version
node create-jsconfig.js

# Remove Typescript from the javascript-version
node remove-ts.js

# Create .eslint in javascript-version
node update-eslint.js

cd ../../../../master-react-mui-nextjs/javascript-version/full-version

# install node_modules
yarn install

# Add javascript version specific eslint plugins
yarn add babel-eslint

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
cd ../../../../master-react-mui-nextjs/typescript-version/full-version
yarn format