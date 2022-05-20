# Generate Starter-kit
node starter-kit-generation.js $1

node replace.js
node remove-files.js
wait 

node moveImgFiles.js
wait 
cp -r ../../../../materialize-mui-react-nextjs-admin-template/typescript-version/starter-kit/public ../../../../materialize-mui-react-nextjs-admin-template/javascript-version/starter-kit/public