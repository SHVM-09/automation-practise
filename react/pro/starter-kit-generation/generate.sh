# Generate Starter-kit
node starter-kit-generation.js $1

node replace.js
node remove-files.js
wait 

node moveImgFiles.js
wait 
cp -r ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/starter-kit/public ../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/starter-kit/public