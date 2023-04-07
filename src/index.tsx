import {
  AppState,
  type AppStateStatus,
  NativeEventEmitter,
  type NativeEventSubscription,
  Platform,
} from 'react-native';

import RNFS from 'react-native-fs';

import { Barrier } from './Barrier';
import { SIGNALS, STATES } from './constants';
import ReactNativeStaticServer from './ReactNativeStaticServer';
import Semaphore from './Semaphore';
import Emitter from './Emitter';

export { STATES };

// ID-to-StaticServer map for all potentially active server instances,
// used to route native events back to JS server objects.
const servers: { [id: string]: StaticServer } = {};

const nativeEventEmitter = new NativeEventEmitter(ReactNativeStaticServer);

nativeEventEmitter.addListener(
  'RNStaticServer',
  ({ serverId, event, details }) => {
    const server = servers[serverId];
    if (server) {
      switch (event) {
        case SIGNALS.CRASHED:
          // TODO: When server crashes,
          // we should get and message the crash
          // reason.
          if (server._signalBarrier) {
            server._signalBarrier.reject(Error('Native server crashed'));
          } else {
            // NOTE: Beside this state change, when server crashes while in active
            // state, other state changes are managed by .start() and ._stop()
            // methods, thus no need to do ._setState() explicitly here.
            server._setState(STATES.CRASHED, details);
          }
          break;
        case SIGNALS.TERMINATED:
          if (server._signalBarrier) {
            server._signalBarrier.resolve();
          }
          break;
        default:
          throw Error(`Unexpected signal ${event}`);
      }
    }
  },
);

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

// TODO: This should go into a dedicated .ts file, to make it easy to refer
// to the default config we use from documentation, and also to not pollute
// with lighttpd configuration other .ts files with actual business logic.
/**
 * Creates a temporary file with standard configuration for Lighttpd,
 * with just a few most important config values taken from the caller.
 * @param fileDir
 * @param hostname
 * @param port
 * @return {Promise<string>} Resolves to the name of the created config file.
 */
async function generateConfig(
  fileDir: string,
  hostname: string,
  port: number,
): Promise<string> {
  const workDir = `${RNFS.TemporaryDirectoryPath}/__rn-static-server__`;
  await RNFS.mkdir(`${workDir}/uploads`);
  const configFile = `${workDir}/config-${Date.now()}.txt`;
  await RNFS.writeFile(
    configFile,
    `server.document-root = "${fileDir}"
    server.bind = "${hostname}"
    server.errorlog-use-syslog = "enable"
    server.upload-dirs = ( "${workDir}/uploads" )
    server.port = ${port}
    # debug.log-file-not-found = "enable"
    # debug.log-request-handling = "enable"
    # server.errorlog = "${workDir}/errors.txt"
    index-file.names += ("index.xhtml", "index.html", "index.htm", "default.htm", "index.php")
    mimetype.assign = (
      # These are default types from https://redmine.lighttpd.net/projects/lighttpd/wiki/Mimetype_assignDetails

      ".epub" => "application/epub+zip",
      ".ncx" => "application/xml",
      ".pdf" => "application/pdf",
      ".sig" => "application/pgp-signature",
      ".spl" => "application/futuresplash",
      ".class" => "application/octet-stream",
      ".ps" => "application/postscript",
      ".torrent" => "application/x-bittorrent",
      ".dvi" => "application/x-dvi",
      ".gz" => "application/x-gzip",
      ".pac" => "application/x-ns-proxy-autoconfig",
      ".swf" => "application/x-shockwave-flash",
      ".tar.gz" => "application/x-tgz",
      ".tgz"          =>      "application/x-tgz",
      ".tar"          =>      "application/x-tar",
      ".zip"          =>      "application/zip",
      ".mp3"          =>      "audio/mpeg",
      ".m3u"          =>      "audio/x-mpegurl",
      ".wma"          =>      "audio/x-ms-wma",
      ".wax"          =>      "audio/x-ms-wax",
      ".ogg"          =>      "application/ogg",
      ".wav"          =>      "audio/x-wav",
      ".gif"          =>      "image/gif",
      ".jpg"          =>      "image/jpeg",
      ".jpeg"         =>      "image/jpeg",
      ".png"          =>      "image/png",
      ".xbm"          =>      "image/x-xbitmap",
      ".xpm"          =>      "image/x-xpixmap",
      ".xwd"          =>      "image/x-xwindowdump",
      ".css"          =>      "text/css; charset=utf-8",
      ".html"         =>      "text/html",
      ".htm"          =>      "text/html",
      ".js"           =>      "text/javascript",
      ".asc"          =>      "text/plain; charset=utf-8",
      ".c"            =>      "text/plain; charset=utf-8",
      ".cpp"          =>      "text/plain; charset=utf-8",
      ".log"          =>      "text/plain; charset=utf-8",
      ".conf"         =>      "text/plain; charset=utf-8",
      ".text"         =>      "text/plain; charset=utf-8",
      ".txt"          =>      "text/plain; charset=utf-8",
      ".spec"         =>      "text/plain; charset=utf-8",
      ".dtd"          =>      "text/xml",
      ".xml"          =>      "text/xml",
      ".mpeg"         =>      "video/mpeg",
      ".mpg"          =>      "video/mpeg",
      ".mov"          =>      "video/quicktime",
      ".qt"           =>      "video/quicktime",
      ".avi"          =>      "video/x-msvideo",
      ".asf"          =>      "video/x-ms-asf",
      ".asx"          =>      "video/x-ms-asf",
      ".wmv"          =>      "video/x-ms-wmv",
      ".bz2"          =>      "application/x-bzip",
      ".tbz"          =>      "application/x-bzip-compressed-tar",
      ".tar.bz2" =>      "application/x-bzip-compressed-tar",
      ".odt" => "application/vnd.oasis.opendocument.text",
      ".ods" => "application/vnd.oasis.opendocument.spreadsheet",
      ".odp" => "application/vnd.oasis.opendocument.presentation",
      ".odg" => "application/vnd.oasis.opendocument.graphics",
      ".odc" => "application/vnd.oasis.opendocument.chart",
      ".odf" => "application/vnd.oasis.opendocument.formula",
      ".odi" => "application/vnd.oasis.opendocument.image",
      ".odm" => "application/vnd.oasis.opendocument.text-master",
      ".opf" => "application/oebps-package+xml",
      ".ott" => "application/vnd.oasis.opendocument.text-template",
      ".ots" => "application/vnd.oasis.opendocument.spreadsheet-template",
      ".otp" => "application/vnd.oasis.opendocument.presentation-template",
      ".otg" => "application/vnd.oasis.opendocument.graphics-template",
      ".otc" => "application/vnd.oasis.opendocument.chart-template",
      ".otf" => "font/otf",
      ".oti" => "application/vnd.oasis.opendocument.image-template",
      ".oth" => "application/vnd.oasis.opendocument.text-web",
      ".svg" => "image/svg+xml",
      ".ttf" => "font/ttf",
      ".xhtml" => "application/xhtml+xml",

    # make the default mime type application/octet-stream.
      ""     => "application/octet-stream",
    )`,
    'utf8',
  );
  return configFile;
}

// TODO: The idea for later implementation is to allow users to provide their
// own lighttpd config files with completely custom configuration. To do so,
// we'll probably split StaticServer class in two: the BaseServer will run
// server with given config path, and it will contain the logic like server
// state watching, stopInBackground, etc. The StaticServer class will extend it,
// allowing the current interface (starting the server with default config,
// and providing the most important config options via arguments), it will
// hold the props for accesing those options, selected hostname and port, etc.
// (as BaseServer will run the server on whatever port is given in provided
// config, but it won't be able to tell user what address / port it was, etc.).
class StaticServer {
  // NOTE: could be a private method, and we tried it, but it turns out that
  // Babel's @babel/plugin-proposal-private-methods causes many troubles in RN.
  // See: https://github.com/birdofpreyru/react-native-static-server/issues/6
  // and: https://github.com/birdofpreyru/react-native-static-server/issues/9
  _appStateSub?: NativeEventSubscription;
  _configPath?: string;
  _fileDir: string;
  _hostname = '';

  /* DEPRECATED */ _nonLocal: boolean;

  _origin: string = '';
  _stopInBackground: boolean;
  _port: number;

  // This barrier is used during start-up and stopage of the server to wait for
  // a success/failure signal from the native side.
  _signalBarrier?: Barrier<void>;

  _state: STATES = STATES.INACTIVE;
  _stateChangeEmitter = new Emitter();

  // TODO: It will be better to use UUID, but I believe "uuid" library
  // I would use won't work in RN without additional workarounds applied
  // to RN setup to get around some issues with randombytes support in
  // RN JS engine. Anyway, it should be double-checked later, but using
  // timestamps as ID will do for now.

  // NOTE: For some reasons RN-Windows corrupts large numbers sent
  // as event arguments across JS / Native boundary.
  // Everything smaller than 65535 seems to work fine, so let's just
  // truncate these IDs for now.
  // See: https://github.com/microsoft/react-native-windows/issues/11322
  _id = Date.now() % 65535;

  // It is used to serialize state change requests, thus ensuring that parallel
  // requests to start / stop the server won't result in a corrupt state.
  _sem = new Semaphore(true);

  get fileDir() {
    return this._fileDir;
  }

  get hostname() {
    return this._hostname;
  }

  /** @deprecated */
  get nonLocal() {
    return this._nonLocal;
  }

  get origin() {
    return this._origin;
  }

  get stopInBackground() {
    return this._stopInBackground;
  }

  get port() {
    return this._port;
  }

  get state() {
    return this._state;
  }

  _setState(neu: STATES, details: string = '') {
    this._state = neu;
    this._stateChangeEmitter.emit(neu, details);
  }

  /**
   * Creates a new Server instance.
   */
  constructor({
    fileDir,
    hostname = 'localhost',

    /* DEPRECATED */ nonLocal = false,

    port = 0,
    stopInBackground = false,
  }: {
    fileDir: string;
    hostname?: string;

    /* DEPRECATED */ nonLocal?: boolean;

    port?: number;
    stopInBackground?: boolean;
  }) {
    this._nonLocal = nonLocal;
    this._hostname = nonLocal && hostname === 'localhost' ? '' : hostname;

    this._port = port;
    this._stopInBackground = stopInBackground;

    if (!fileDir) throw Error('`fileDir` MUST BE a non-empty string');
    else if (!isAbsolutePath(fileDir)) {
      fileDir = `${RNFS.DocumentDirectoryPath}/${fileDir}`;
    }
    this._fileDir = fileDir;
  }

  addStateListener(listener: (newState: STATES, details: string) => void) {
    return this._stateChangeEmitter.addListener(listener);
  }

  _configureAppStateHandling() {
    if (this._stopInBackground) {
      if (!this._appStateSub) {
        this._appStateSub = AppState.addEventListener(
          'change',
          this._handleAppStateChange.bind(this),
        );
      }
    } else if (this._appStateSub) {
      this._appStateSub.remove();
      this._appStateSub = undefined;
    }
  }

  async _removeConfigFile() {
    try {
      if (this._configPath) await RNFS.unlink(this._configPath);
    } catch {
      // noop
    } finally {
      this._configPath = undefined;
    }
  }

  /**
   * This method throws if server is not in a "stable" state, i.e. not in one
   * of these: ACTIVE, CRASHED, INACTIVE.
   */
  _stableStateGuard() {
    switch (this._state) {
      case STATES.ACTIVE:
      case STATES.CRASHED:
      case STATES.INACTIVE:
        return;
      default:
        throw Error(`Server is in unstable state ${this._state}`);
    }
  }

  /**
   * @param {string} [details] Optional. If provided, it will be added
   * to the STARTING message emitted to the server state change listeners.
   * @returns {Promise<string>}
   */
  async start(details?: string): Promise<string> {
    try {
      await this._sem.seize();
      this._stableStateGuard();
      if (this._state === STATES.ACTIVE) return this._origin!;
      servers[this._id] = this;
      this._setState(STATES.STARTING, details);
      this._configureAppStateHandling();

      // NOTE: This is done at the first start only, to avoid hostname changes
      // when server is paused for background and automatically reactivated
      // later. Same for automatic port selection.
      if (!this._hostname) {
        this._hostname = await ReactNativeStaticServer.getLocalIpAddress();
      }
      if (!this._port) {
        this._port = await ReactNativeStaticServer.getOpenPort();
      }

      await this._removeConfigFile();
      this._configPath = await generateConfig(
        this._fileDir,
        this._hostname,
        this._port,
      );

      // Native implementations of .start() method must resolve only once
      // the server has been launched (ready to handle incoming requests).
      await ReactNativeStaticServer.start(this._id, this._configPath);
      this._origin = `http://${this._hostname}:${this._port}`;
      this._setState(STATES.ACTIVE);
      this._removeConfigFile();
      return this._origin;
    } catch (e: any) {
      this._setState(STATES.CRASHED, e.message);
      throw e;
    } finally {
      this._sem.setReady(true);
    }
  }

  /**
   * Soft-stop the server: if automatic pause for background is enabled,
   * it will be automatically reactivated when the app goes into foreground
   * again. End users are expected to use public .stop() method below, which
   * additionally cleans-up that automatic re-activation.
   * @param {string} [details] Optional. If provided, it will be added
   *  to the STOPPING message emitted to the server state change listeners.
   * @returns {Promise<>}
   */
  async _stop(details?: string) {
    try {
      await this._sem.seize();
      this._stableStateGuard();
      if (this._state !== STATES.ACTIVE) return;
      this._setState(STATES.STOPPING, details);

      // Our synchronization logic assumes when we arrive here any previously
      // set barriers should be cleared up already.
      if (this._signalBarrier) throw Error('Internal error');

      this._signalBarrier = new Barrier();
      await ReactNativeStaticServer.stop();
      await (this._signalBarrier as Promise<void>);

      this._setState(STATES.INACTIVE);
    } catch (e: any) {
      this._setState(STATES.CRASHED);
      throw e;
    } finally {
      delete servers[this._id];
      this._signalBarrier = undefined;
      this._sem.setReady(true);
    }
  }

  /**
   * Stops or pauses the server, if it is running, depending on whether it was
   * started with keepAlive option or not (note, keepAlive means that server is
   * not paused / restarted when the app goes into background). Pausing the
   * server means it will
   * automatically start again the next time the app transitions from background
   * to foreground. To ensure the server is stopped for good, pass in `kill`
   * flag. In that case only explicit call to .start() will start the server
   * again.
   * @param {string} [details] Optional. If provided, it will be added
   *  to the STOPPING message emitted to the server state change listeners.
   * @returns {Promise<>}
   */
  async stop(details?: string) {
    if (this._appStateSub) {
      this._appStateSub.remove();
      this._appStateSub = undefined;
    }
    await this._stop(details);
  }

  _handleAppStateChange(appState: AppStateStatus) {
    if (appState === 'active') this.start('App entered foreground');
    else this._stop('App entered background');
  }
}

export default StaticServer;

/**
 * Extracts bundled assets into the specified regular directory,
 * preserving asset folder structure, and overwriting any conflicting files
 * in the destination.
 *
 * This is an Android-specific function; it does nothing if called on iOS.
 *
 * @param {string} [into=''] Optional. The destination folder for extracted
 *  assets. By default assets are extracted into the app's document folder.
 * @param {string} [from=''] Optional. Relative path of the root asset folder,
 *  starting from which all assets contained in that folder and its subfolders
 *  will be extracted into the destination folder, preserving asset folder
 *  structure. By default all bundled assets will be extracted.
 * @return {Promise} Resolves once unpacking is completed.
 */
export async function extractBundledAssets(
  into = RNFS.DocumentDirectoryPath,
  from = '',
) {
  if (Platform.OS !== 'android') return;

  await RNFS.mkdir(into);
  const assets = await RNFS.readDirAssets(from);
  for (let i = 0; i < assets.length; ++i) {
    const asset = assets[i]!;
    const target = `${into}/${asset.name}`;
    if (asset.isDirectory()) await extractBundledAssets(target, asset.path);
    else await RNFS.copyFileAssets(asset.path, target);
  }
}

/**
 * Returns a server instance currently being in ACTIVE, STARTING,
 * or STOPPING state, if such server instance exists.
 * @return {StaticServer|undefined}
 */
export function getActiveServer() {
  return Object.values(servers).find(
    (server) =>
      server.state !== STATES.INACTIVE && server.state !== STATES.CRASHED,
  );
}
