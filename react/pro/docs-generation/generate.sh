# Replace necessary content
node replace.js
cd ../../../../master-react-mui-nextjs/docs

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
cd ../automation-scripts/react/pro/docs-generation
node reset
