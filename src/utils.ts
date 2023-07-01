import { Platform } from 'react-native';
import { getDeviceType } from 'react-native-device-info';
import RNFS from 'react-native-fs';

type PLATFORM = 'ANDROID' | 'IOS' | 'MACOS' | 'WINDOWS';

function getPlatform(): PLATFORM {
  switch (Platform.OS) {
    case 'android':
      return 'ANDROID';
    case 'ios':
      return getDeviceType() === 'Desktop' ? 'MACOS' : 'IOS';
    default:
      throw Error('Unsupported platform');
  }
}

const PLATFORM: PLATFORM = getPlatform();

const BASE_ASSET_DIRS: { [key in typeof PLATFORM]: string } = {
  ANDROID: RNFS.DocumentDirectoryPath,
  IOS: RNFS.MainBundlePath,
  MACOS: `${RNFS.MainBundlePath}/Contents/Resources`,
  WINDOWS: RNFS.MainBundlePath,
};

const BASE_ASSET_DIR = BASE_ASSET_DIRS[PLATFORM];

const SEP = PLATFORM === 'WINDOWS' ? '\\' : '/';

/**
 * Returns `true` if given path is absolute, `false` otherwise.
 * @param {string} path
 * @return {boolean}
 */
function isAbsolutePath(path: string): boolean {
  if (!path) return false;

  if (Platform.OS === 'windows') {
    return !!path.match(/^[a-zA-Z]:\\/);
  }

  // This should do for Android and iOS.
  return path.startsWith('/') || path.startsWith('file:///');
}

/**
 * If given `path` is relative, it returns the corresponding absolute path,
 * resolved relative to the platform-specific base location for bundled assets;
 * otherwise, it just returns given absolute path as is.
 * @param path Absolute or relative path.
 * @return Absolute path.
 */
export function resolveAssetsPath(path: string): string {
  return isAbsolutePath(path) ? path : `${BASE_ASSET_DIR}${SEP}${path}`;
}
