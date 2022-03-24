# Compile Typescript files to React JS files in a new directory javascript-version in the new folder
tsc --project ../../../../master-react-mui-nextjs/typescript-version/tsconfig.jsx.json

# Copy package.json, eslintrc, gitignore, prettierrc, Readme, editorconfig files into newly created folder javascript-version
cp ../../../../master-react-mui-nextjs/typescript-version/package.json ../../../../master-react-mui-nextjs/typescript-version/next.config.js ../../../../master-react-mui-nextjs/typescript-version/next-env.d.ts ../../../../master-react-mui-nextjs/typescript-version/.gitignore ../../../../master-react-mui-nextjs/typescript-version/.prettierrc.js ../../../../master-react-mui-nextjs/typescript-version/.editorconfig ../../../../master-react-mui-nextjs/typescript-version/.env ../../../../master-react-mui-nextjs/javascript-version/

# Copy .vscode & public directories into javascript-version for assets and .vscode configurations
cp -r  ../../../../master-react-mui-nextjs/typescript-version/public ../../../../master-react-mui-nextjs/typescript-version/styles ../../../../master-react-mui-nextjs/javascript-version/

# Remove Typescript from the javascript-version
node create-jsconfig.js

# Remove Typescript from the javascript-version
node remove-ts.js

# Create .eslint in javascript-version
node update-eslint.js

cd ../../../../master-react-mui-nextjs/javascript-version

# install node_modules
yarn install

# Add javascript version specific eslint plugins
yarn add babel-eslint

# Run yarn lint command to fix all the linting error and give space after imports
yarn lint

# Run yarn format command to format all the files using prettier
yarn format
