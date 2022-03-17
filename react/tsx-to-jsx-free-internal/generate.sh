# Compile Typescript files to React JS files in a new directory javascript-version in the new folder
tsc --project ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/tsconfig.jsx.json

# Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder javascript-version
cp ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/package.json ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/next.config.js ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/next-env.d.ts ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/.gitignore ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/.prettierrc.js ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/.editorconfig ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/.env ../../../materio-mui-react-nextjs-admin-template-free/javascript-version/

# Copy .vscode & public directories into javascript-version for assets and .vscode configurations
cp -r  ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/public ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/styles ../../../materio-mui-react-nextjs-admin-template-free/javascript-version/

# Remove Typescript from the javascript-version
node create-jsconfig.js

# Remove Typescript from the javascript-version
node remove-ts.js

# Create .eslint in javascript-version
node update-eslint.js

cd ../../../materio-mui-react-nextjs-admin-template-free/javascript-version

# install node_modules
yarn install

# Add javascript version specific eslint plugins
yarn add eslint-plugin-react eslint-plugin-import babel-eslint

# Run yarn lint command to fix all the linting error and give space after imports
yarn lint

# Run yarn format command to format all the files using prettier
yarn format
