#!/bin/bash

set -e

# This script is intended for PCRE2 and Lighttpd Windows build with Cygwin.
# As of now (2023.02.10) it does not look feasible to hook up Lighttpd build
# directly into MSVS project, because its code written with GCC compiler in
# mind relies on a bunch of compiler attributes MSVS is not able to handle,
# that apart of any additional build problems that are potentially there.
# Thus, a separate pre-build with Cygwin, and then bundling resulting binaries
# and DLLs into RN app looks the only feasible option for Windows as of now.
#
# So... asuming you want re-build the binaries, and you are on Windows machine,
# and you have Cygwin installed, run this script from Cygwin console. Yeah,
# you apparently need CMake, GCC, and ZLib packages installed as a part
# of your Cygwin setup.
#

# NOTE: With the current Lighttpd's CMakeList.txt Cygwin/CMake fails to build
# the project as a collection of shared libraries, because linker fails with
# a bunch of unlinked symbols in modules. That happens because a bunch of shared
# code is bundled into the main lighttpd.exe, and not linked into separate
# modules. One way to fix it would be to build that shared code as a separate
# shared lib, which is linked into every module, and the main exe. Probably,
# there are other ways (e.g. just configure the liner to ignore it, and probably
# it will still work fine runtime)? For now, let's just build a single exe
# with three modules bundled-in (these are the same modules we include on
# other platforms for the moment).
cmake -B build -DBUILD_STATIC=1 ..
cmake --build build --target pcre2-8-static lighttpd mod_indexfile \
  mod_dirlisting mod_staticfile
mkdir -p lighttpd
cp build/lighttpd1.4/build/lighttpd.exe \
  /usr/bin/cygwin1.dll \
  lighttpd
