project(rn-static-server C)
cmake_minimum_required(VERSION 3.7.0 FATAL_ERROR)

macro(install)
endmacro(install)

add_subdirectory(pcre2)

if(CMAKE_SYSTEM_NAME MATCHES "Android")
  set(BUILD_SHARED_LIBS 1)
endif()

set(CMAKE_PREFIX_PATH ${CMAKE_BINARY_DIR}/pcre2)

add_subdirectory(lighttpd1.4)

add_dependencies(lighttpd pcre2-8-static)

target_include_directories(lighttpd
  PRIVATE ${CMAKE_BINARY_DIR}/lighttpd1.4/build
  PRIVATE ${CMAKE_BINARY_DIR}/pcre2
)

target_link_directories(lighttpd
  PRIVATE ${CMAKE_BINARY_DIR}/lighttpd1.4/build
  PRIVATE ${CMAKE_BINARY_DIR}/pcre2
)

file(WRITE ${CMAKE_BINARY_DIR}/lighttpd1.4/build/plugin-static.h
  PLUGIN_INIT(mod_indexfile)\n
  PLUGIN_INIT(mod_dirlisting)\n
  PLUGIN_INIT(mod_staticfile)\n
)
