# Replace necessary content
node replace.js

wait

cd ../../../../materio-mui-react-nextjs-admin-template/docs

# Build docs
yarn build

# Move out generated folder
mv ./.vuepress/dist documentation
mv ./documentation ../
cd ../
# Zip generated folder
zip -r documentation.zip documentation
# Remove generated folder
rm -rf documentation

# Reset replaced content
cd ../automation-scripts/react/market-place-scripts/docs-generation
node reset.js
