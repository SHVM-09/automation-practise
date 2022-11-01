# # Remove already generated starter-kit

# cd ../starter-kit-generation
# node starter-kit-generation.js &
# wait
# cd ../package-generation

# # Remove already generated package
# if [ -d "../../../../materio-mui-react-nextjs-admin-template-free/package" ]; then
#     rm -rf ../../../../materio-mui-react-nextjs-admin-template-free/package
# fi
# wait
# generate package folder
node package-generation.js $1

wait

cp ../../../../materio-mui-react-nextjs-admin-template-free/documentation.html ../../../../materio-mui-react-nextjs-admin-template-free/CHANGELOG.md ../../../../materio-mui-react-nextjs-admin-template-free/package


cd ../../../../materio-mui-react-nextjs-admin-template-free/typescript-version/full-version
yarn format

wait

cd ../../


mv package materio-mui-react-nextjs-admin-template-free


# Zip the package
zip -r materio-mui-react-nextjs-admin-template-free.zip materio-mui-react-nextjs-admin-template-free
# # Remove package folder
rm -rf materio-mui-react-nextjs-admin-template-free

# cd ../automation-scripts/react/pro/package-generation

# if [ -d "../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version" ]; then
#     cd ../../../../materio-mui-react-nextjs-admin-template-free/javascript-version/full-version
#     yarn format
#     yarn lint
# fi

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

