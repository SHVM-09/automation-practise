# Replace necessary content
node replace.js $1
cd ../../../../materio-mui-react-nextjs-admin-template/docs

# Build docs
yarn build

# Move out generated folder
mv ./.vuepress/dist ../documentation

# Reset replaced content
cd ../../automation-scripts/react/pro/docs-generation
node reset
