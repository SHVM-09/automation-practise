# Replace necessary content
node replace.js $1

wait

cd ../../../../materio-mui-react-nextjs-admin-template-free/docs

# Build docs
yarn build

# Move out generated folder
mv ./.vuepress/dist ../documentation

# Reset replaced content
cd ../../automation-scripts/react/marketplace/docs-generation
node reset.js
