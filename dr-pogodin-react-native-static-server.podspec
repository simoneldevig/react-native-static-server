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
    # TODO: This should be re-added, but maybe different sets of files.
    #:output_files => [
    #  '${BUILT_PRODUCTS_DIR}/libpcre2-8.a',
    #  '${BUILT_PRODUCTS_DIR}/iblighttpd.a'
      # It also depends on compiled module files!
    #],
    :script => <<-CMD
      set -e
      cmake ${PODS_TARGET_SRCROOT} -B ${TARGET_TEMP_DIR} \
        -DCMAKE_OSX_DEPLOYMENT_TARGET=${IPHONEOS_DEPLOYMENT_TARGET} \
        -DCMAKE_SYSTEM_NAME=iOS \
        -DBUILD_STATIC=1 \
        -DBUILD_LIBRARY=1 \
        -GXcode
      cmake --build ${TARGET_TEMP_DIR} --config ${CONFIGURATION} \
        --target mod_indexfile mod_dirlisting mod_staticfile \
          lighttpd
      cp  ${TARGET_TEMP_DIR}/lighttpd1.4/build/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}/*.a \
          ${TARGET_TEMP_DIR}/pcre2/Release${EFFECTIVE_PLATFORM_NAME}/*.a \
          ${BUILT_PRODUCTS_DIR}
    CMD
  }

  $otherLibToolFlags = "-llighttpd -lpcre2-8 -lmod_staticfile -lmod_indexfile -lmod_dirlisting"

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
