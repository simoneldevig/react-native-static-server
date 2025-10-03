require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeStaticServer"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/birdofpreyru/react-native-static-server.git", :tag => "#{s.version}" }

  s.preserve_paths = 'README.md', 'package.json', 'index.js'

  s.source_files = "ios/**/*.{h,m,mm,cpp}"
  s.private_header_files = "ios/**/*.h"
  s.vendored_frameworks = "ios/build/ReactNativeStaticServer.xcframework"

  s.pod_target_xcconfig    = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
  }
  install_modules_dependencies(s)
end
