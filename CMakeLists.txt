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

if(CMAKE_SYSTEM_NAME MATCHES "Android")
  set(
    EXTRA_BUILD_ARGS
    -DANDROID_ABI=${ANDROID_ABI}
    -DANDROID_PLATFORM=${ANDROID_PLATFORM}
    -DANDROID_STL=${ANDROID_STL}
    -GNinja
  )
endif()

execute_process(
  COMMAND cmake ${CMAKE_CURRENT_SOURCE_DIR}/pcre2
    -B ${CMAKE_BINARY_DIR}/pcre2
    -DBUILD_SHARED_LIBS=ON
    -DCMAKE_BUILD_TYPE=Release
    -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/sysroot
    -DCMAKE_MAKE_PROGRAM=${CMAKE_MAKE_PROGRAM}
    -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}
    ${EXTRA_BUILD_ARGS}
)

execute_process(COMMAND cmake --build ${CMAKE_BINARY_DIR}/pcre2 --config Release)
execute_process(COMMAND cmake --install ${CMAKE_BINARY_DIR}/pcre2)

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

add_subdirectory(lighttpd1.4)

file(WRITE ${CMAKE_BINARY_DIR}/lighttpd1.4/build/plugin-static.h
  PLUGIN_INIT(mod_indexfile)\n
  PLUGIN_INIT(mod_dirlisting)\n
  PLUGIN_INIT(mod_staticfile)\n
)
