cmake_minimum_required(VERSION 3.5 FATAL_ERROR)
project(GLOB C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED TRUE)

set(HEADERS collate.h freebsd-compat.h glob.h)
set(SOURCES glob.c)

add_compile_definitions(__USE_BSD)
add_library(glob ${HEADERS} ${SOURCES})

install(TARGETS glob)
install(FILES ${HEADERS} DESTINATION include)
