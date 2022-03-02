set -e
# Generate demo configs
node generate-demo-configs.js

# Demo generation loop
for i in {1..2}
do
# Replace necessary in src folder
	node replace.js demo-$i
  cd ../../../master-react-mui-nextjs/typescript-version/full-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../../../master-react-mui-nextjs/demo-$i
  cd ../../../automation-scripts/react/demo-generation
# Zip and remove demo folder 
  # zip -r demo-$i.zip demo-$i
  # rm -rf demo-$i
# Reset the replaced content before
  node reset.js demo-$i
done
