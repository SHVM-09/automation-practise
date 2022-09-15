# # Remove already generated starter-kit

# cd ../starter-kit-generation
# node starter-kit-generation.js &
# wait
# cd ../package-generation

# # Remove already generated package
# if [ -d "../../../master-react-mui-nextjs/package" ]; then
#     rm -rf ../../../master-react-mui-nextjs/package
# fi
# wait
# generate package folder
node package-generation.js $1

wait

cp ../../../../master-react-mui-nextjs/documentation.html ../../../../master-react-mui-nextjs/CHANGELOG.md ../../../../master-react-mui-nextjs/package

wait 

cd ../../../../master-react-mui-nextjs/typescript-version/full-version
yarn format


if [ -d "../../../../master-react-mui-nextjs/javascript-version/full-version" ]; then
    cd ../../../../master-react-mui-nextjs/javascript-version/full-version
    yarn format
fi

wait

cd ../../../automation-scripts/react/marketplace/package-generation

node replace.js

wait

cd ../../../../master-react-mui-nextjs/typescript-version/full-version

wait
mkdir ../../package-standard
cp -a ../../package/javascript-version  ../../package-standard/javascript-version
cp ../../package/CHANGELOG.md  ../../package-standard/CHANGELOG.md
cp ../../package/documentation.html  ../../package-standard/documentation.html

wait 

mv ../../package ../../master-react-mui-nextjs
mv ../../package-standard ../../master-react-mui-nextjs-standard

wait

# Zip the package
cd ../../
zip -r master-react-mui-nextjs.zip master-react-mui-nextjs
zip -r master-react-mui-nextjs-standard.zip master-react-mui-nextjs-standard

# Remove package folder
rm -rf master-react-mui-nextjs
rm -rf master-react-mui-nextjs-standard



# n=0
# commands=("node ../starter-kit-generation/starter-kit-generation.js" "node package-generation.js $1")
# for cmd in "${commands[@]}"; do
#   eval ${cmd} &
#   wait
#   pid=$! &
#   pidarray[$n]=${pid} & 
#   ((n+=1)) &
#   wait
# done

