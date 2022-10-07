set -e
# Generate demo configs
node modify-build-command.js

# run like :'./generate-demo.sh' in git bash
# Demo generation loop
for i in 1 2 3 4 5 6
do
# Replace necessary in src folder
	node replace.js demo-$i
  
  cd ../../vue/typescript-version/full-version/
# Build the template with replaced content
  yarn build --base=/materio-vuetify-vuejs-admin-template/demo-$i/
# Move the demo to root folder
  mv dist ../../demo-$i
# Reset the replaced content before
  cd ../../../automation-scripts/vue-node/
  node reset.js demo-$i
done