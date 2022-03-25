# Replace necessary content
node replace.js

wait

cd ../../../../master-react-mui-nextjs/docs

# Build docs
yarn build

# Move out generated folder
mv ./.vuepress/dist ../documentation

# Reset replaced content
cd ../../automation-scripts/react/marketplace/docs-generation
node reset.js
