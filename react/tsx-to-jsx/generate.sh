# Compile Typescript files to React JS files in a new directory jsx-version in the new folder
tsc --project ../../tsx-version/full-version/tsconfig.jsx.json

# Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder jsx-version
cp ../../tsx-version/full-version/package.json ../../tsx-version/full-version/next.config.js ../../tsx-version/full-version/next-env.d.ts ../../tsx-version/full-version/.gitignore ../../tsx-version/full-version/.prettierrc.js ../../tsx-version/full-version/.editorconfig ../../tsx-version/full-version/.env ../../jsx-version/full-version/

# Copy .vscode & public directories into jsx-version for assets and .vscode configurations
cp -r  ../../tsx-version/full-version/public ../../tsx-version/full-version/styles ../../jsx-version/full-version/

# Remove Typescript from the jsx-version
node create-jsconfig.js

# Remove Typescript from the jsx-version
node remove-ts.js

# Create .eslint in jsx-version
node update-eslint.js

cd ../../jsx-version/full-version

# install node_modules
yarn install

# Add jsx version specific eslint plugins
yarn add eslint-plugin-react eslint-plugin-import babel-eslint

# Run yarn format command to format all the files using prettier
yarn format

# Run yarn lint command to fix all the linting error and give space after imports
yarn lint


# Copy SourceCode
cd ../../scripts/copy-source
node copySourceTSX.js
node copySourceJSX.js

# Generate DemoConfigs
cd ../../scripts/demo-generation
node generate-demo-configs.js

