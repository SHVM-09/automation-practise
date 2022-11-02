set -e
# Generate demo configs
node generate-demo-configs.js

# Demo generation loop
for i in 1 2 3 4 5 6
do
# Replace necessary in src folder
	node replace.js demo-$i $1
  cd ../../../../master-react-mui-nextjs/typescript-version/full-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../../demo-$i
# Reset the replaced content before
  cd ../../../automation-scripts/react/marketplace/demo-generation
  node reset.js demo-$i $1
done
