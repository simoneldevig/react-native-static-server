require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "dr-pogodin-react-native-static-server"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/birdofpreyru/react-native-static-server.git", :tag => "#{s.version}" }

  s.preserve_paths = 'README.md', 'package.json', 'index.js'
  s.source_files = "ios/**/*.{h,m,mm}"

  s.dependency "React-Core"

  # This requires CMake on the build host, which can be installed via Homebrew (https://brew.sh)
  s.script_phase = {
    :name => 'Build native dependencies',
    :execution_position => :before_compile,
    :output_files => [
      # Note: Below is the list of all build products generated from PRCE2,
      # Lighttpd, and this library, as of now; the commented out modules are
      # not currently used by our library.
      '${BUILT_PRODUCTS_DIR}/liblighttpd.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_accesslog.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_ajp13.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_auth.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_authn_file.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_cgi.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_deflate.a',
      '${BUILT_PRODUCTS_DIR}/libmod_dirlisting.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_extforward.a',
      '${BUILT_PRODUCTS_DIR}/libmod_h2.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_proxy.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_rrdtool.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_sockproxy.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_ssi.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_status.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_userdir.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_vhostdb.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_webdav.a',
      # '${BUILT_PRODUCTS_DIR}/libmod_wstunnel.a',
      '${BUILT_PRODUCTS_DIR}/libpcre2-8.a'
    ],
    :script => <<-CMD
      set -e

      if [[ ${PLATFORM_FAMILY_NAME} == "iOS" ]]
      then
        EXTRA_CONFIG_ARGS="-DCMAKE_OSX_ARCHITECTURES=arm64;x86_64 -DCMAKE_OSX_DEPLOYMENT_TARGET=${IPHONEOS_DEPLOYMENT_TARGET} -DCMAKE_SYSTEM_NAME=iOS -GXcode"
        BUILD_OUTPUT_FOLDER_LIGHTTPD="/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}"
        BUILD_OUTPUT_FOLDER_PCRE2="/Release${EFFECTIVE_PLATFORM_NAME}"
      else
        # This assumes Mac Catalyst build.
        EXTRA_CONFIG_ARGS="-DCMAKE_OSX_ARCHITECTURES=arm64;x86_64"
      fi

      cmake ${PODS_TARGET_SRCROOT} -B ${TARGET_TEMP_DIR} \
        -DBUILD_STATIC=1 -DBUILD_LIBRARY=1 ${EXTRA_CONFIG_ARGS}

      cmake --build ${TARGET_TEMP_DIR} --config ${CONFIGURATION} --target lighttpd

      cp  ${TARGET_TEMP_DIR}/lighttpd1.4/build${BUILD_OUTPUT_FOLDER_LIGHTTPD}/*.a \
          ${TARGET_TEMP_DIR}/pcre2${BUILD_OUTPUT_FOLDER_PCRE2}/*.a \
          ${BUILT_PRODUCTS_DIR}
    CMD
  }

  $otherLibToolFlags = "-llighttpd -lpcre2-8 -lmod_dirlisting -lmod_h2"

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "OTHER_LIBTOOLFLAGS" => $otherLibToolFlags,
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    # TODO: Can we put these flags into a variable, and then qoute it here,
    # and above where the same flags should be set?
    s.pod_target_xcconfig    = {
        "OTHER_LIBTOOLFLAGS" => $otherLibToolFlags
    }
  end
end
