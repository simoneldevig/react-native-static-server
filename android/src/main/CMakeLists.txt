project(rn-static-server C)
cmake_minimum_required(VERSION 3.7.0 FATAL_ERROR)

add_subdirectory(../../../pcre2 pcre2)

include_directories(
  ${CMAKE_BINARY_DIR}/lighttpd/build
  ${CMAKE_BINARY_DIR}/pcre2
)

link_directories(${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

add_subdirectory(../../../lighttpd1.4 lighttpd)

add_dependencies(lighttpd-common pcre2-8-shared)
add_dependencies(lighttpd pcre2-8-shared)

set_target_properties(lighttpd PROPERTIES OUTPUT_NAME "liblighttpd")
