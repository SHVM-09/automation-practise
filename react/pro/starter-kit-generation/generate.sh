# Generate Starter-kit
node starter-kit-generation.js $1

node replace.js
node remove-files.js
wait 

node moveImgFiles.js
wait 
cp -r ../../../../master-react-mui-nextjs/typescript-version/starter-kit/public ../../../../master-react-mui-nextjs/javascript-version/starter-kit/public