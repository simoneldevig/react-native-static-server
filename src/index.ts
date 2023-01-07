import {
  AppState,
  AppStateStatus,
  NativeEventEmitter,
  NativeEventSubscription,
  NativeModules,
} from 'react-native';

import RNFS from 'react-native-fs';

import {Barrier} from './Barrier';
import {SIGNALS, STATES} from './constants';
import Semaphore from './Semaphore';
import Emitter from './Emitter';

declare global {
  var __turboModuleProxy: object | undefined;
}

// This selects between TurboModule and legacy RN library implementation.
const FPStaticServer = global.__turboModuleProxy
  ? require('./NativeStaticServer').default
  : NativeModules.StaticServer;

// ID-to-StaticServer map for all potentially active server instances,
// used to route native events back to JS server objects.
const servers: {[id: string]: StaticServer} = {};

const nativeEventEmitter = new NativeEventEmitter(FPStaticServer);

nativeEventEmitter.addListener('RNStaticServer', ({event, serverId}) => {
  const server = servers[serverId];
  if (server) {
    switch (event) {
      case SIGNALS.CRASHED:
        // NOTE: Other server states either do not suggest to receive a crash
        // signals, as the server is not active, or their state update will be
        // handled by the function which handles corresponding state change,
        // e.g. start() or stop().
        if (server.state === STATES.STARTED) {
          server._setState(STATES.RUNTIME_FAILURE);
        }
        if (server._signalBarrier) {
          server._signalBarrier.reject(Error('Native server crashed'));
          server._signalBarrier = undefined;
        }
        break;
      case SIGNALS.LAUNCHED:
      case SIGNALS.TERMINATED:
        if (server._signalBarrier) {
          server._signalBarrier.resolve();
          server._signalBarrier = undefined;
        }
        break;
      default:
        throw Error(`Unexpected signal ${event}`);
    }
  }
});

type Options = {
  keepAlive?: boolean;
  localOnly?: boolean;
};

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
  port: string,
): Promise<string> {
  const workDir = `${RNFS.TemporaryDirectoryPath}/__rn-static-server__`;
  await RNFS.mkdir(`${workDir}/uploads`);
  const configFile = `${workDir}/config-${Date.now()}.txt`;
  await RNFS.writeFile(
    configFile,
    `server.document-root = "${fileDir}"
    server.bind = "${hostname}"
    server.errorlog = "${workDir}/error.log"
    server.upload-dirs = ( "${workDir}/uploads" )
    server.port = ${port}
    # debug.log-file-not-found = "enable"
    # debug.log-request-handling = "enable"
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

class StaticServer {
  // NOTE: could be a private method, and we tried it, but it turns out that
  // Babel's @babel/plugin-proposal-private-methods causes many troubles in RN.
  // See: https://github.com/birdofpreyru/react-native-static-server/issues/6
  // and: https://github.com/birdofpreyru/react-native-static-server/issues/9
  _appStateSub?: NativeEventSubscription;
  _configPath?: string;
  _hostname = '';
  _localOnly = false;
  _origin?: string;
  _port = '';

  // This barrier is used during start-up and stopage of the server to wait for
  // a success/failure signal from the native side.
  _signalBarrier?: Barrier;

  _state: STATES = STATES.STOPPED;
  _stateChangeEmitter = new Emitter();

  // TODO: It will be better to use UUID, but I believe "uuid" library
  // I would use won't work in RN without additional workarounds applied
  // to RN setup to get around some issues with randombytes support in
  // RN JS engine. Anyway, it should be double-checked later, but using
  // timestamps as ID will do for now.
  _id = Date.now();

  // It is used to serialize state change requests, thus ensuring that parallel
  // requests to start / stop the server won't result in a corrupt state.
  _sem = new Semaphore(true);

  keepAlive: boolean;

  _root: string;

  get localOnly() {
    return this._localOnly;
  }

  get port() {
    return this._port;
  }

  get root() {
    return this._root;
  }

  get state() {
    return this._state;
  }

  _setState(neu: STATES) {
    this._state = neu;
    this._stateChangeEmitter.emit(neu);
  }

  /**
   * Creates a new StaticServer instance.
   *
   * Because the legacy, the following alternative signatures are supported,
   * and the overall constructor implementation is thus subpar.
   *
   * new StaticServer(port, root, opts);
   * new StaticServer(port, opts);
   * new StaticServer(port, root);
   * new StaticServer(opts);
   * new StaticServer(port);
   * new StaticServer();
   *
   * @param portOrOpts
   * @param rootOrOpts
   * @param opts
   */
  constructor(
    portOrOpts?: number | Options,
    rootOrOpts?: Options | string,
    opts?: Options,
  ) {
    let root = '';
    switch (arguments.length) {
      case 3:
        this._port = `${portOrOpts}`;

        if (typeof rootOrOpts === 'string') root = rootOrOpts;
        else if (rootOrOpts) throw Error('Invalid "root" type');

        this._localOnly = (opts && opts.localOnly) || false;
        this.keepAlive = (opts && opts.keepAlive) || false;
        break;
      case 2:
        this._port = `${portOrOpts}`;

        if (typeof rootOrOpts === 'string') {
          root = rootOrOpts;
          this.keepAlive = false;
        } else {
          this._localOnly = (rootOrOpts && rootOrOpts.localOnly) || false;
          this.keepAlive = (rootOrOpts && rootOrOpts.keepAlive) || false;
        }
        break;
      case 1:
        if (typeof portOrOpts === 'number') {
          this._port = `${portOrOpts}`;
          this.keepAlive = false;
        } else {
          this._localOnly = (portOrOpts && portOrOpts.localOnly) || false;
          this.keepAlive = (portOrOpts && portOrOpts.keepAlive) || false;
        }
        break;
      default:
        this.keepAlive = false;
    }

    if (!root.startsWith('/') && !root.startsWith('file:///')) {
      root = new URL(root, RNFS.DocumentDirectoryPath).href;
    }
    this._root = root;
  }

  addStateListener(listener: (newState: STATES) => void) {
    return this._stateChangeEmitter.addListener(listener);
  }

  _configureAppStateHandling() {
    if (this.keepAlive) {
      if (this._appStateSub) {
        this._appStateSub.remove();
        this._appStateSub = undefined;
      }
    } else if (!this._appStateSub) {
      this._appStateSub = AppState.addEventListener(
        'change',
        this._handleAppStateChange.bind(this),
      );
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

  async start(): Promise<string> {
    try {
      await this._sem.seize();
      if (this.state === STATES.STARTED) return this._origin!;
      servers[this._id] = this;
      this._setState(STATES.STARTING);
      this._configureAppStateHandling();

      // NOTE: These are done on the first start only, to ensure that possible
      // automatic restarts of the same server instance do not alter hostname
      // and port values.
      if (!this._hostname) {
        this._hostname = this._localOnly
          ? 'localhost'
          : await FPStaticServer.getLocalIpAddress();
      }

      if (!this._port || this._port === '0') {
        this._port = await FPStaticServer.getOpenPort();
      }

      await this._removeConfigFile();
      this._configPath = await generateConfig(
        this._root,
        this._hostname,
        this._port,
      );

      // Our synchronization logic assumes when we arrive here any previously
      // set barriers should be cleared up already.
      if (this._signalBarrier) throw Error('Internal error');

      this._signalBarrier = new Barrier();

      // This resolves once startup is initiated, but we need to wait for
      // "LAUNCHED" signal from the native side to be sure the server is up.
      await FPStaticServer.start(this._configPath);
      await (<Promise<void>>this._signalBarrier);

      this._origin = `http://${this._hostname}:${this._port}`;
      await this._removeConfigFile();

      this._setState(STATES.STARTED);
      return this._origin;
    } catch (e: any) {
      this._setState(STATES.START_FAILURE);
      throw e;
    } finally {
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
   * @param kill
   * @returns {Promise<>}
   */
  async stop(kill = false) {
    try {
      await this._sem.seize();
      if (this._state === STATES.STOPPED) return;
      if (kill && this._appStateSub) {
        this._appStateSub.remove();
        this._appStateSub = undefined;
      }

      if (this._state === STATES.STARTED) {
        this._setState(
          this._appStateSub && !kill ? STATES.PAUSING : STATES.STOPPING,
        );

        // Our synchronization logic assumes when we arrive here any previously
        // set barriers should be cleared up already.
        if (this._signalBarrier) throw Error('Internal error');

        this._signalBarrier = new Barrier();
        await FPStaticServer.stop();
        await (<Promise<void>>this._signalBarrier);
      }

      this._setState(
        this._appStateSub && !kill ? STATES.PAUSED : STATES.STOPPED,
      );
    } catch (e: any) {
      this._setState(
        this._appStateSub && !kill ? STATES.PAUSE_FAILURE : STATES.STOP_FAILURE,
      );
      throw e;
    } finally {
      delete servers[this._id];
      this._sem.setReady(true);
    }
  }

  _handleAppStateChange(appState: AppStateStatus) {
    if (appState === 'active') this.start();
    else this.stop();
  }

  get origin() {
    return this._origin;
  }
}

export default StaticServer;
