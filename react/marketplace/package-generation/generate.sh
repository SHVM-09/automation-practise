# # Remove already generated starter-kit

# cd ../starter-kit-generation
# node starter-kit-generation.js &
# wait
# cd ../package-generation

# # Remove already generated package
# if [ -d "../../../materio-mui-react-nextjs-admin-template-free/package" ]; then
#     rm -rf ../../../materio-mui-react-nextjs-admin-template-free/package
# fi
# wait
# generate package folder
node package-generation.js $1

wait

cp ../../../../materio-mui-react-nextjs-admin-template-free/documentation.html ../../../../materio-mui-react-nextjs-admin-template-free/CHANGELOG.md ../../../../materio-mui-react-nextjs-admin-template-free/package

wait 

cd ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version
yarn format


if [ -d "../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version" ]; then
    cd ../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version
    yarn format
fi

wait

cd ../../../automation-scripts/react/marketplace/package-generation

node replace.js

wait

cd ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version

wait
mkdir ../../package-standard
cp -a ../../package/javascript-version  ../../package-standard/javascript-version
cp ../../package/CHANGELOG.md  ../../package-standard/CHANGELOG.md
cp ../../package/documentation.html  ../../package-standard/documentation.html

wait 

mv ../../package ../../materio-mui-react-nextjs-admin-template-free
mv ../../package-standard ../../materio-mui-react-nextjs-admin-template-free-standard

wait

# Zip the package
cd ../../
zip -r materio-mui-react-nextjs-admin-template-free.zip materio-mui-react-nextjs-admin-template-free
zip -r materio-mui-react-nextjs-admin-template-free-standard.zip materio-mui-react-nextjs-admin-template-free-standard

# Remove package folder
rm -rf materio-mui-react-nextjs-admin-template-free
rm -rf materio-mui-react-nextjs-admin-template-free-standard



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

