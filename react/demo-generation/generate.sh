set -e
# Generate demo configs
node generate-demo-configs.js

# Demo generation loop
for i in {1..6}
do
# Replace necessary in src folder
	node replace.js demo-$i
  cd ../../tsx-version/full-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../../demo-$i
  cd ../../
# Zip and remove demo folder 
  zip -r demo-$i.zip demo-$i
  rm -rf demo-$i
# Reset the replaced content before
  cd scripts/demo-generation
  node reset.js demo-$i
done
