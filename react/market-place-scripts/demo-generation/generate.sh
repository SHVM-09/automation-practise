set -e
# Generate demo configs
node generate-demo-configs.js

# Demo generation loop
for i in {1..6}
do
# Replace necessary in src folder
	node replace.js demo-$i
  cd ../../../../materio-mui-react-nextjs-admin-template/typescript-version/full-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../../demo-$i
  cd ../../../automation-scripts/react/market-place-scripts/demo-generation
# Zip and remove demo folder 
  # zip -r ../../../../materio-mui-react-nextjs-admin-template/demo-$i.zip ../../../../materio-mui-react-nextjs-admin-template/demo-$i
  # rm -rf ../../../../materio-mui-react-nextjs-admin-template/demo-$i
# Reset the replaced content before
  node reset.js demo-$i
done
