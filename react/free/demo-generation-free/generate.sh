set -e

# Replace necessary in src folder
	node replace.js
  cd ../../../../master-react-mui-nextjs/typescript-version/
# Build the template with replaced content
  yarn build
  yarn next export
# Move the demo to root folder
  mv out ../demo
  cd ../
# Zip and remove demo folder 
  zip -r demo.zip demo
  rm -rf demo
  wait
# Reset the replaced content before
  cd ../automation-scripts/react/free/demo-generation-free
  node reset.js
