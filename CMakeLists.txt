project(rn-static-server C)
cmake_minimum_required(VERSION 3.7.0 FATAL_ERROR)

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
  set(PCRE2_TARGET --target pcre2-8-static)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -target x86_64-apple-ios-macabi")
  set(
    EXTRA_BUILD_ARGS
    -DCMAKE_C_FLAGS=${CMAKE_C_FLAGS}
    -DCMAKE_OSX_ARCHITECTURES=${ESCAPED_ARCHS}
  )
elseif(CMAKE_SYSTEM_NAME MATCHES "iOS")
  set(
    EXTRA_BUILD_ARGS
    -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
    -DCMAKE_OSX_ARCHITECTURES=${ESCAPED_ARCHS}
    -DCMAKE_OSX_DEPLOYMENT_TARGET=${CMAKE_OSX_DEPLOYMENT_TARGET}
    -DCMAKE_IOS_INSTALL_COMBINED=${CMAKE_IOS_INSTALL_COMBINED}
    -GXcode
  )
  set(PCRE2_TARGET --target pcre2-8-static)
endif()

if(CMAKE_SYSTEM_NAME MATCHES "Android|Windows")
  set(EXTRA_BUILD_ARGS ${EXTRA_BUILD_ARGS} -DBUILD_SHARED_LIBS=ON)
endif()

execute_process(
  COMMAND cmake ${CMAKE_CURRENT_SOURCE_DIR}/pcre2
    -B ${CMAKE_BINARY_DIR}/pcre2
    -DCMAKE_BUILD_TYPE=Release
    -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/sysroot
    -DCMAKE_MAKE_PROGRAM=${CMAKE_MAKE_PROGRAM}
    ${EXTRA_BUILD_ARGS}

  # TODO: This is a handy option, but requires CMake >= 3.15
  # COMMAND_ECHO STDOUT

  # TODO: This is a useful argument, but requires CMake >= 3.19
  # COMMAND_ERROR_IS_FATAL ANY
)

execute_process(
  COMMAND cmake --build ${CMAKE_BINARY_DIR}/pcre2
    --config Release
    ${PCRE2_TARGET}
)

if(
  NOT CMAKE_SYSTEM_NAME MATCHES "iOS"

  # TODO: We wanna say "and not Mac Catalyst build", for which the current
  # condition is not specific enough, but will do for now, as Mac Catalyst
  # build is the only scenario we gonna have Darwin as the target platform
  # as of now.
  AND NOT CMAKE_SYSTEM_NAME MATCHES "Darwin"
)
  execute_process(COMMAND cmake --install ${CMAKE_BINARY_DIR}/pcre2)
endif()

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

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DPCRE2_CODE_UNIT_WIDTH=8 -I${CMAKE_BINARY_DIR}/sysroot/include -L${CMAKE_BINARY_DIR}/sysroot/lib")

# To find PCRE2 Lighttpd first of all tries to use pkg_check_modules().
# It seems that on Linux it ends up relying on pkg-config utility of the host
# system, which find the host's version of PCRE2. With CMake 3.18.1 it was fine,
# as it used to output the linker flag for PCRE2 just as "-lpcre2-8",
# and just above we set the correct -L flag with the path of PCRE2
# cross-compiled for Android. However, with CMake 3.22.1 the CMake's default
# output is "-L/usr/lib/x86_64-linux-gnu;-lpcre2-8", which ends up forcing
# Lighttpd to try linking against the host's PCRE2, which fails. The flag set
# below instructs pkg-config to not include -L flag into outputs,
# thus restoring the correct linking. However, it is not the best fix,
# I guess.
# TODO: Find a better fix.
set(PKG_CONFIG_ARGN --libs-only-l)

add_subdirectory(lighttpd1.4)

file(WRITE ${CMAKE_BINARY_DIR}/lighttpd1.4/build/plugin-static.h
  PLUGIN_INIT(mod_dirlisting)\n
  PLUGIN_INIT(mod_h2)\n
  PLUGIN_INIT(mod_indexfile)\n
  PLUGIN_INIT(mod_staticfile)\n
)
