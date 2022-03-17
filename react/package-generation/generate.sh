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

cp ../../../materio-mui-react-nextjs-admin-template-free/documentation.html ../../../materio-mui-react-nextjs-admin-template-free/CHANGELOG.md ../../../materio-mui-react-nextjs-admin-template-free/package

wait 

if [ -d "../../../materio-mui-react-nextjs-admin-template-free/package" ]; then
    node remove-test.js
fi

cd ../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version
yarn format


if [ -d "../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version" ]; then
    cd ../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version
    yarn format
fi

mv ../../../materio-mui-react-nextjs-admin-template-free/package ../../../materio-mui-react-nextjs-admin-template-free/materio-mui-react-nextjs-admin-template-free

wait

# Zip the package
cd ../../../materio-mui-react-nextjs-admin-template-free
zip -r materio-mui-react-nextjs-admin-template-free.zip materio-mui-react-nextjs-admin-template-free
# Remove package folder
rm -rf materio-mui-react-nextjs-admin-template-free



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

