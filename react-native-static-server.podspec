require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'react-native-static-server'
  s.version        = package['version']
  s.summary        = package['title']
  s.description    = package['description']
  s.license        = package['license']
  s.authors        = {
    'Dr. Sergey Pogodin' => 'doc@pogodin.studio',
    'Fred Chasen' => 'fchasen@gmail.com'
  }
  s.homepage       = package['homepage']
  s.source         = {
    :git => 'https://github.com/birdofpreyru/react-native-static-server.git',
    :tag => 'v' + package['version']
  }

  s.requires_arc   = true
  s.platform       = :ios, '7.0'

  s.preserve_paths = 'README.md', 'package.json', 'index.js'
  s.source_files   = 'ios/*.{h,m}'

  s.dependency 'React'
  s.dependency 'GCDWebServer', '~> 3.0'
end
