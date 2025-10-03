#!/bin/bash

set -e

if [[ ${CONFIGURATION} == "Debug" ]]
then
  LIGHTTPD_CONFIG="Debug"
else
  LIGHTTPD_CONFIG="Release"
fi

if [[ ${PLATFORM_FAMILY_NAME} == "iOS" ]]
then
  EXTRA_CONFIG_ARGS="-DCMAKE_OSX_ARCHITECTURES=arm64;x86_64 -DCMAKE_OSX_DEPLOYMENT_TARGET=${IPHONEOS_DEPLOYMENT_TARGET} -DCMAKE_SYSTEM_NAME=iOS -GXcode"
  BUILD_OUTPUT_FOLDER_LIGHTTPD="/${LIGHTTPD_CONFIG}${EFFECTIVE_PLATFORM_NAME}"
  BUILD_OUTPUT_FOLDER_PCRE2="/Release${EFFECTIVE_PLATFORM_NAME}"
else
  # This assumes Mac Catalyst build.
  EXTRA_CONFIG_ARGS="-DCMAKE_OSX_ARCHITECTURES=arm64;x86_64"
fi

# Get the project root (2 levels up from the Xcode project)
PROJECT_ROOT="${PROJECT_DIR}/.."

cmake "${PROJECT_ROOT}" -B ${TARGET_TEMP_DIR} \
  -DBUILD_STATIC=1 -DBUILD_LIBRARY=1 ${EXTRA_CONFIG_ARGS} ${EXTRA_CMAKE_ARGS} -DWITH_MOD_WEBDAV=ON

cmake --build ${TARGET_TEMP_DIR} --config ${LIGHTTPD_CONFIG} --target lighttpd

# Debug: Show what files were built
echo "=== Built lighttpd files ==="
ls -la ${TARGET_TEMP_DIR}/lighttpd1.4/build${BUILD_OUTPUT_FOLDER_LIGHTTPD}/*.a 2>/dev/null || echo "No lighttpd .a files found"

echo "=== Built pcre2 files ==="
ls -la ${TARGET_TEMP_DIR}/pcre2${BUILD_OUTPUT_FOLDER_PCRE2}/*.a 2>/dev/null || echo "No pcre2 .a files found"

echo "=== Copying files to ${BUILT_PRODUCTS_DIR} ==="
cp  ${TARGET_TEMP_DIR}/lighttpd1.4/build${BUILD_OUTPUT_FOLDER_LIGHTTPD}/*.a \
    ${TARGET_TEMP_DIR}/pcre2${BUILD_OUTPUT_FOLDER_PCRE2}/*.a \
    ${BUILT_PRODUCTS_DIR}

echo "=== Final built products ==="
ls -la ${BUILT_PRODUCTS_DIR}/*.a 2>/dev/null || echo "No .a files in built products dir"
