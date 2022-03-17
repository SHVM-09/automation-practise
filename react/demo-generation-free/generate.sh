set -e

# Replace necessary in src folder
	node replace.js demo
  cd ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../demo
  cd ../
# Zip and remove demo folder 
  zip -r demo.zip demo
  rm -rf demo
  
# Reset the replaced content before
  cd ../automation-scripts/react/demo-generation-free
  node reset.js demo
