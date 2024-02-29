#!/bin/bash

# Function: Create banner
function banner() {
    msg="# $* #"
    edge=$(echo "$msg" | sed 's/./#/g')

    echo ""
    echo ""
    echo "$edge"
    echo "$msg"
    echo "$edge"
    echo ""
}

ROOT_DIR=$(pwd)
LOG_FILE_PATH=$ROOT_DIR/install-$(date +%H_%M_%S).log

# Redirecting all output to a log file
exec > "$LOG_FILE_PATH" 2>&1

# Paths
TS_FULL_PATH=$ROOT_DIR/typescript-version/full-version
TS_SK_PATH=$ROOT_DIR/typescript-version/starter-kit
JS_FULL_PATH=$ROOT_DIR/javascript-version/full-version
JS_SK_PATH=$ROOT_DIR/javascript-version/starter-kit

# 👉 Script Execution

# ---- TS Full

echo Navigating to TS Full
cd $TS_FULL_PATH

# NPM
banner NPM: TS Full
echo Installing deps using npm
npm install --legacy-peer-deps

echo Removing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Yarn
banner Yarn: TS Full
echo Installing deps using yarn
yarn install

echo Removing node_modules and yarn.lock
rm -rf node_modules yarn.lock

# PNPM
banner PNPM: TS Full
echo Installing deps using pnpm
pnpm install

# echo Removing node_modules and pnpm-lock.yaml
# rm -rf node_modules pnpm-lock.yaml

# ---- TS SK

echo Navigating to TS SK
cd $TS_SK_PATH

# NPM
banner NPM: TS SK
echo Installing deps using npm
npm install --legacy-peer-deps

echo Removing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Yarn
banner Yarn: TS SK
echo Installing deps using yarn
yarn install

echo Removing node_modules and yarn.lock
rm -rf node_modules yarn.lock

# PNPM
banner PNPM: TS SK
echo Installing deps using pnpm
pnpm install

# echo Removing node_modules and pnpm-lock.yaml
# rm -rf node_modules pnpm-lock.yaml

# ---- JS Full

echo Navigating to JS Full
cd $JS_FULL_PATH

# NPM
banner NPM: JS Full
echo Installing deps using npm
npm install --legacy-peer-deps

echo Removing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Yarn
banner Yarn: JS Full
echo Installing deps using yarn
yarn install

echo Removing node_modules and yarn.lock
rm -rf node_modules yarn.lock

# PNPM
banner PNPM: JS Full
echo Installing deps using pnpm
pnpm install

# echo Removing node_modules and pnpm-lock.yaml
# rm -rf node_modules pnpm-lock.yaml

# ---- JS SK

echo Navigating to JS SK
cd $JS_SK_PATH

# NPM
banner NPM: JS SK
echo Installing deps using npm
npm install --legacy-peer-deps

echo Removing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Yarn
banner Yarn: JS SK
echo Installing deps using yarn
yarn install

echo Removing node_modules and yarn.lock
rm -rf node_modules yarn.lock

# PNPM
banner PNPM: JS SK
echo Installing deps using pnpm
pnpm install

# echo Removing node_modules and pnpm-lock.yaml
# rm -rf node_modules pnpm-lock.yaml
