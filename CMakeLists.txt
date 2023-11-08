project(rn-static-server C)
cmake_minimum_required(VERSION 3.22.1 FATAL_ERROR)

# This prevents CMake from complaining that INSTALL(..) directives in
# Lighttpd CMakeLists.txt miss BUNDLE DESTINATION.
set(CMAKE_MACOSX_BUNDLE OFF)

# Pre-build of PCRE2 for the target system from sources.

if(CMAKE_CROSSCOMPILING AND CMAKE_HOST_SYSTEM_NAME MATCHES "Windows")
  file(
    COPY ${CMAKE_CURRENT_SOURCE_DIR}/windows/ReactNativeStaticServer/lighttpd/lemon.exe
    DESTINATION ${CMAKE_BINARY_DIR}/lighttpd1.4/build
  )
  set(LEMON_PATH ${CMAKE_BINARY_DIR}/lighttpd1.4/build/lemon.exe)
endif()

# Note: Archs in CMAKE_OSX_ARCHITECTURES are separated by semi-colons,
# if we don't escape semi-colons before inserting the value into other
# variables, most CMake commands will treat that semi-colon as argument
# separator in the list, and replace them with whitspaces, leading
# to obscure errors (e.g. it may successfully complete the build,
# but effectively doing it for the first of the archs only, and leave us
# to wonder, why something does not link for some arch later).
string(REPLACE ";" "\\\;" ESCAPED_ARCHS "${CMAKE_OSX_ARCHITECTURES}")

if(CMAKE_SYSTEM_NAME MATCHES "Android")
  set(
    EXTRA_BUILD_ARGS
    -DANDROID_ABI=${ANDROID_ABI}
    -DANDROID_PLATFORM=${ANDROID_PLATFORM}
    -DANDROID_STL=${ANDROID_STL}
    -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
    -GNinja
  )

# TODO: This aims Mac Catalyst build, and needs a more specific condition,
# but will do like this for now, as we are not doing native Mac builds, thus
# Mac Catalyst build is the only scenario we have where the target system name
# is Darwin.
elseif(CMAKE_SYSTEM_NAME MATCHES "Darwin")
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -target x86_64-apple-ios-macabi")
  set(
    EXTRA_BUILD_ARGS
    -DCMAKE_C_FLAGS=${CMAKE_C_FLAGS}
    -DCMAKE_OSX_ARCHITECTURES=${ESCAPED_ARCHS}
  )
  # This allows to not sign compiled PCRE2 executables for iOS / macOS builds,
  # we don't really use them anyway, but we need them build for the install
  # command below to work.
  set(EXTRA_INSTALL_ARGS "-- CODE_SIGNING_ALLOWED=NO")

elseif(CMAKE_SYSTEM_NAME MATCHES "iOS")
  set(
    EXTRA_BUILD_ARGS
    -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
    -DCMAKE_OSX_ARCHITECTURES=${ESCAPED_ARCHS}
    -DCMAKE_OSX_DEPLOYMENT_TARGET=${CMAKE_OSX_DEPLOYMENT_TARGET}
    -DCMAKE_IOS_INSTALL_COMBINED=${CMAKE_IOS_INSTALL_COMBINED}
    -GXcode
  )
  # This allows to not sign compiled PCRE2 executables for iOS / macOS builds,
  # we don't really use them anyway, but we need them build for the install
  # command below to work.
  set(EXTRA_INSTALL_ARGS "-- CODE_SIGNING_ALLOWED=NO")
endif()

if(CMAKE_SYSTEM_NAME MATCHES "Android|Windows")
  set(EXTRA_BUILD_ARGS ${EXTRA_BUILD_ARGS} -DBUILD_SHARED_LIBS=ON)
endif()

execute_process(
  COMMAND ${CMAKE_COMMAND} ${CMAKE_CURRENT_SOURCE_DIR}/pcre2
    -B ${CMAKE_BINARY_DIR}/pcre2
    -DCMAKE_BUILD_TYPE=Release
    -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/sysroot
    -DCMAKE_MAKE_PROGRAM=${CMAKE_MAKE_PROGRAM}
    ${EXTRA_BUILD_ARGS}
  COMMAND_ECHO STDOUT
  COMMAND_ERROR_IS_FATAL ANY
)

execute_process(
  COMMAND ${CMAKE_COMMAND} --build ${CMAKE_BINARY_DIR}/pcre2
    --config Release ${EXTRA_INSTALL_ARGS}
)

execute_process(COMMAND ${CMAKE_COMMAND} --install ${CMAKE_BINARY_DIR}/pcre2)

# Copies shared PCRE2 library into the folder from where Gradle automatically
# will bundle it in the host app package.
if(CMAKE_SYSTEM_NAME MATCHES "Android")
  file(
    COPY ${CMAKE_BINARY_DIR}/sysroot/lib/libpcre2-8.so
    DESTINATION ${CMAKE_CURRENT_SOURCE_DIR}/android/src/main/jniLibs/${ANDROID_ABI}
  )
endif()

if(CMAKE_SYSTEM_NAME MATCHES "Android|Windows")
  set(BUILD_SHARED_LIBS 1)
endif()

# These enforce pkg_check_modules(), find_program(), etc. in Lighttpd CMake
# config to look for local build of PCRE2 in the location it was installed to.
set(CMAKE_PREFIX_PATH "${CMAKE_BINARY_DIR}/sysroot")

# TODO: Not sure now, whether this is needed, or already covered by the variable
# above.
set(CMAKE_FIND_ROOT_PATH "${CMAKE_BINARY_DIR}/sysroot")

add_subdirectory(lighttpd1.4)

set(PLUGIN_STATIC
  PLUGIN_INIT(mod_alias)\n
  PLUGIN_INIT(mod_dirlisting)\n
  PLUGIN_INIT(mod_h2)\n
  PLUGIN_INIT(mod_indexfile)\n
  PLUGIN_INIT(mod_staticfile)\n
)

if(WITH_MOD_WEBDAV)
  set(PLUGIN_STATIC "${PLUGIN_STATIC}PLUGIN_INIT(mod_webdav)\n")
endif()

file(WRITE ${CMAKE_BINARY_DIR}/lighttpd1.4/build/plugin-static.h
  ${PLUGIN_STATIC}
)
