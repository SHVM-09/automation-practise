set -e
# Generate demo configs
node generate-demo-configs.js

# Demo generation loop
for i in {1..6}
do
# Replace necessary in src folder
	node replace.js demo-$i
  cd ../../../../master-react-mui-nextjs/typescript-version/full-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../../demo-$i
  cd ../../../automation-scripts/react/pro/demo-generation
# Zip and remove demo folder 
  zip -r ../../../../master-react-mui-nextjs/demo-$i.zip ../../../../master-react-mui-nextjs/demo-$i
  rm -rf ../../../../master-react-mui-nextjs/demo-$i
# Reset the replaced content before
  node reset.js demo-$i
done
