#!/bin/bash

# 👉 Variables
ROOT_DIR=$(pwd)
LOG_FILE_PATH=$ROOT_DIR/exec-$(date +%H_%M_%S).log

# Paths
TS_FULL_PATH=$ROOT_DIR/typescript-version/full-version
TS_SK_PATH=$ROOT_DIR/typescript-version/starter-kit
JS_FULL_PATH=$ROOT_DIR/javascript-version/full-version
JS_SK_PATH=$ROOT_DIR/javascript-version/starter-kit

# 👉 Utility Functions
function start_spinner() {
    # Create a spinner graphic
    SPINNER="-\|/"

    i=0
    while : ; do
        printf "\b%s" "${SPINNER:i++%${#SPINNER}:1}"
        sleep 0.1
    done &

    # Save spinner process ID to kill it later
    SPINNER_PID=$!

    trap 'stop_spinner; exit;' SIGINT # ℹ️ Stop the spinner when the script is interrupted
}

function stop_spinner() {
    # Kill the spinner
    kill $SPINNER_PID
    
    # Clear the spinner characters
    printf "\b"
}

function redirect_output_to_file() {
    local LOG_FILE_PATH=$1

    exec 3>&1 4>&2 # Save the original file descriptors
    exec > "$LOG_FILE_PATH" 2>&1 # Redirect stdout and stderr to the log file
}

function reset_output_redirection() {
    exec 1>&3 2>&4
}

function blank_lines() {
    local COUNT=$1
    for ((i=0; i<COUNT; i++)); do
        echo ""
    done
}

function with_blank_lines() {
    local VARIANT=$1
    local MSG=$2
    local BLANK_LINES_COUNT=${3:-1} # Default to 1 blank line

    [ "$VARIANT" == "t" ] && blank_lines $BLANK_LINES_COUNT && echo $MSG
    [ "$VARIANT" == "b" ] && echo $MSG && blank_lines $BLANK_LINES_COUNT
    [ "$VARIANT" == "tb" ] && blank_lines $BLANK_LINES_COUNT && echo $MSG && blank_lines $BLANK_LINES_COUNT
}

function banner() {
    local LABEL=$1
    local LEVEL=$2

    if [ "$LEVEL" -eq 1 ]; then
        msg="# $LABEL #"
        edge=$(echo "$msg" | sed 's/./#/g')

        blank_lines 2
        echo "####################################"
        echo "# --- $LABEL"
        echo "####################################"
        echo ""
    elif [ "$LEVEL" -eq 2 ]; then
        echo ""
        echo "#"
        echo "# --- $LABEL"
        echo "#"
        echo ""
    elif [ "$LEVEL" -eq 3 ]; then
        echo ""
        echo "# --- $LABEL"
        echo ""
    else
        echo "🚨 ERROR: Invalid level"
        exit 1
    fi
}

# 👉 Functions
function install_and_build() {
    local INSTALL_CMD=$1
    local BUILD_CMD=$2

    banner "⬇️ [$PKG_MANAGER] Installing deps" 2
    $INSTALL_CMD # Execute the command

    banner "🛠️  [$PKG_MANAGER] Building" 2
    $BUILD_CMD # Execute the command
}

function cmd() {
    # ℹ️ This `$1` is function argument
    local PKG_MANAGER=$1

    if [ $PKG_MANAGER == "npm" ]; then
        install_and_build "npm install --legacy-peer-deps" "npm run build"
    elif [ $PKG_MANAGER == "yarn" ]; then
        install_and_build "yarn" "yarn build"
    else
        install_and_build "pnpm i" "pnpm build"
    fi
}

function clean() {
    echo "🗑️ Removing node_modules, lock files & build artifacts"
    rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml dist .nuxt
}

function exec_on_dir() {
    # ℹ️ Assign to local vars for readability
    local DIR_LABEL=$1
    local DIR_PATH=$2

    PKG_MANAGERS=(npm yarn pnpm)

    blank_lines 3
    banner "⚗️ Working on $DIR_LABEL" 1
    cd $DIR_PATH

    for PKG_MANAGER in ${PKG_MANAGERS[@]}; do
        cmd $PKG_MANAGER

        # ℹ️ Don't run clean for pnpm
        [ $PKG_MANAGER != "pnpm" ] && clean
    done
}

# 👉 Script Execution
start_spinner

# ℹ️ Redirecting all output to a log file
redirect_output_to_file $LOG_FILE_PATH

exec_on_dir "TS Full" $TS_FULL_PATH
exec_on_dir "TS SK" $TS_SK_PATH
exec_on_dir "JS Full" $JS_FULL_PATH
exec_on_dir "JS SK" $JS_SK_PATH

# ❗ Order of the following two commands is important
reset_output_redirection # From now on, all output will be printed to the terminal

# Once we reset the stdout and stderr, allow stop_spinner to remove the spinner graphic from the terminal
stop_spinner
