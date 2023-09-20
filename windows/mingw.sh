#!/bin/bash
set -e

# This script pre-builds Lighttpd into a static Windows library.
# To use it:
# - Install MSYS2 (https://www.msys2.org).
# - Run the default MSYS2 UCRT64 console, and execute the following command
#   to install necessary dependencies:
#   $ pacman -S mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-cmake \
#     mingw-w64-ucrt-x86_64-ninja mingw-w64-ucrt-x86_64-pcre2
# - Check-out the correct code version in the /lighttpd1.4 folder (the master
#   branch of Lighttpd repo does not support MinGW build yet, you need some
#   commit from the win32-exp branch).
# - Then run this script from within the same MSYS2 UCRT64 console.

SCRIPT_FOLDER=$(dirname $(realpath $0))
ROOT_FOLDER=$(dirname $SCRIPT_FOLDER)
BUILD_FOLDER="$SCRIPT_FOLDER/build"
OUTPUT_FOLDER="$SCRIPT_FOLDER/ReactNativeStaticServer/lighttpd"
MSYS2_PATH="/ucrt64"

cmake $ROOT_FOLDER -B $BUILD_FOLDER -G Ninja \
  -DBUILD_LIBRARY=ON -DCMAKE_BUILD_TYPE=Release
cmake --build $BUILD_FOLDER --target mod_dirlisting mod_h2 mod_webdav lighttpd

mkdir -p $OUTPUT_FOLDER
cd $BUILD_FOLDER/lighttpd1.4/build
cp *.dll $OUTPUT_FOLDER

# NOTE: The Lemon binary created here is used by Android builds on Windows.
cp lemon.exe $OUTPUT_FOLDER

cd $BUILD_FOLDER/sysroot/bin
cp libpcre2-8.dll $OUTPUT_FOLDER

cd $MSYS2_PATH/bin
cp libwinpthread-1.dll $OUTPUT_FOLDER
