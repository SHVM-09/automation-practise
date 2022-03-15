# # Remove already generated starter-kit

# cd ../starter-kit-generation
# node starter-kit-generation.js &
# wait
# cd ../package-generation

# # Remove already generated package
# if [ -d "../../../materio-mui-react-nextjs-admin-template-free-internal/package" ]; then
#     rm -rf ../../../materio-mui-react-nextjs-admin-template-free-internal/package
# fi
# wait
# generate package folder
node package-generation.js $1

wait

cp ../../../materio-mui-react-nextjs-admin-template-free-internal/documentation.html ../../../materio-mui-react-nextjs-admin-template-free-internal/CHANGELOG.md ../../../materio-mui-react-nextjs-admin-template-free-internal/package

wait 

if [ -d "../../../materio-mui-react-nextjs-admin-template-free-internal/package" ]; then
    node remove-test.js
fi

cd ../../../materio-mui-react-nextjs-admin-template-free-internal/typescript-version/full-version
yarn format


if [ -d "../../../materio-mui-react-nextjs-admin-template-free-internal/javascript-version/full-version" ]; then
    cd ../../../materio-mui-react-nextjs-admin-template-free-internal/javascript-version/full-version
    yarn format
fi

mv ../../../materio-mui-react-nextjs-admin-template-free-internal/package ../../../materio-mui-react-nextjs-admin-template-free-internal/materio-mui-react-nextjs-admin-template-free-internal

wait

# Zip the package
cd ../../../materio-mui-react-nextjs-admin-template-free-internal
zip -r materio-mui-react-nextjs-admin-template-free-internal.zip materio-mui-react-nextjs-admin-template-free-internal
# Remove package folder
rm -rf materio-mui-react-nextjs-admin-template-free-internal



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

