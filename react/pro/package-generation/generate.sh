# # Remove already generated starter-kit

# cd ../starter-kit-generation
# node starter-kit-generation.js &
# wait
# cd ../package-generation

# # Remove already generated package
# if [ -d "../../../../materio-mui-react-nextjs-admin-template/package" ]; then
#     rm -rf ../../../../materio-mui-react-nextjs-admin-template/package
# fi
# wait
# generate package folder
node package-generation.js $1

wait

cp ../../../../materio-mui-react-nextjs-admin-template/documentation.html ../../../../materio-mui-react-nextjs-admin-template/CHANGELOG.md ../../../../materio-mui-react-nextjs-admin-template/package

wait 

if [ -d "../../../../materio-mui-react-nextjs-admin-template/package" ]; then
    node remove-test.js
fi

cd ../../../../materio-mui-react-nextjs-admin-template/typescript-version/full-version
yarn format

wait

cd ../../


mv package materio-mui-react-nextjs-admin-template


# Zip the package
zip -r materio-mui-react-nextjs-admin-template.zip materio-mui-react-nextjs-admin-template
# # Remove package folder
rm -rf materio-mui-react-nextjs-admin-template

cd ../automation-scripts/react/pro/package-generation

if [ -d "../../../../materio-mui-react-nextjs-admin-template/javascript-version/full-version" ]; then
    cd ../../../../materio-mui-react-nextjs-admin-template/javascript-version/full-version
    yarn format    
fi

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

