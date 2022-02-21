# Replace necessary content
node replace.js
cd ../../docs

# Build docs
yarn build

# Move out generated folder
mv .vuepress/dist ../docs-build
# Zip generated folder
zip -r ../docs.zip ../docs-build
cd ../
# Remove generated folder
rm -rf docs-build

# Reset replaced content
cd scripts/docs-generation
node reset
