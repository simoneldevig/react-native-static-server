project(rn-static-server C)
cmake_minimum_required(VERSION 3.7.0 FATAL_ERROR)

# This prevents CMake from complaining that INSTALL(..) directives in
# Lighttpd CMakeLists.txt miss BUNDLE DESTINATION.
set(CMAKE_MACOSX_BUNDLE OFF)

# These ensure pkg-config, if present, attempts to link Lighttpd against our
# local build of PCRE2, rather than the host system's one, if present. Though,
# we don't really install PCRE2 into this location, we just add extra include
# and link directories to ensure that compiler and linker will find the library
# without installation.
set(CMAKE_INSTALL_PREFIX "${CMAKE_BINARY_DIR}/sysroot")
set(ENV{PKG_CONFIG_PATH} "${CMAKE_BINARY_DIR}/pcre2")

add_subdirectory(pcre2)

if(CMAKE_SYSTEM_NAME MATCHES "Android|Windows")
  set(BUILD_SHARED_LIBS 1)
endif()

# set(CMAKE_PREFIX_PATH ${CMAKE_BINARY_DIR}/pcre2)

add_subdirectory(lighttpd1.4)

add_dependencies(lighttpd pcre2-8-static)

# TODO:
# When building for Windows using MSYS/MinGW with pre-installed
# PCRE2 library these commands below confuse the linker, failing
# the build. Should revisit, if these are really needed/correct
# for Android and iOS builds.
if(NOT CMAKE_SYSTEM_NAME MATCHES "Windows")
  target_include_directories(lighttpd
    PRIVATE ${CMAKE_BINARY_DIR}/lighttpd1.4/build
    PRIVATE ${CMAKE_BINARY_DIR}/pcre2
  )

  target_link_directories(lighttpd
    PRIVATE ${CMAKE_BINARY_DIR}/lighttpd1.4/build
    PRIVATE ${CMAKE_BINARY_DIR}/pcre2
  )
endif()

file(WRITE ${CMAKE_BINARY_DIR}/lighttpd1.4/build/plugin-static.h
  PLUGIN_INIT(mod_indexfile)\n
  PLUGIN_INIT(mod_dirlisting)\n
  PLUGIN_INIT(mod_staticfile)\n
)
