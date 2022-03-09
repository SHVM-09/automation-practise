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

cp ../../../master-react-mui-nextjs/documentation.html ../../../master-react-mui-nextjs/CHANGELOG.md ../../../master-react-mui-nextjs/package

wait 

if [ -d "../../../master-react-mui-nextjs/package" ]; then
    node remove-test.js
fi

cd ../../../master-react-mui-nextjs/typescript-version/full-version
yarn format


if [ -d "../../../master-react-mui-nextjs/javascript-version/full-version" ]; then
    cd ../../../master-react-mui-nextjs/javascript-version/full-version
    yarn format
fi


# # Zip the package
# cd ../../../master-react-mui-nextjs/
# zip -r package.zip package
# # Remove package folder
# rm -rf package

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

