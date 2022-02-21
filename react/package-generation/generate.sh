# generate package folder
node package-generation.js $1

Zip the package
cd ../../
zip -r package.zip package
Remove package folder
rm -rf package
