# Replace necessary content
node replace.js $1 $2
cd ../../../../master-react-mui-nextjs/docs

# Build docs
yarn build

# Move out generated folder
mv ./.vuepress/dist ../documentation

# Reset replaced content
cd ../../automation-scripts/react/pro/docs-generation
node reset.js $1 $2
