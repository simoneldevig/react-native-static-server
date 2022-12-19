import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  NativeModules,
  Platform,
} from 'react-native';

import RNFS from 'react-native-fs';

declare global {
  var __turboModuleProxy: object | undefined;
}

// This selects between TurboModule and legacy RN library implementation.
const FPStaticServer = global.__turboModuleProxy
  ? require('./NativeStaticServer').default
  : NativeModules.StaticServer;

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

  _origin?: string;

  keepAlive: boolean;
  localOnly: boolean;

  // NOTE: It was type-defed as "number" prior to v0.6.0, but it was wrong,
  // the value was "string" all along.
  port: string = '';

  root: null | string;
  running: boolean = false;
  started: boolean = false;

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
    switch (arguments.length) {
      case 3:
        this.port = `${portOrOpts}`;

        if (typeof rootOrOpts === 'string') this.root = rootOrOpts || null;
        else if (!rootOrOpts) this.root = null;
        else throw Error('Invalid "root" type');

        this.localOnly = (opts && opts.localOnly) || false;
        this.keepAlive = (opts && opts.keepAlive) || false;
        break;
      case 2:
        this.port = `${portOrOpts}`;

        if (typeof rootOrOpts === 'string') {
          this.root = rootOrOpts;
          this.localOnly = false;
          this.keepAlive = false;
        } else {
          this.root = null;
          this.localOnly = (rootOrOpts && rootOrOpts.localOnly) || false;
          this.keepAlive = (rootOrOpts && rootOrOpts.keepAlive) || false;
        }
        break;
      case 1:
        if (typeof portOrOpts === 'number') {
          this.port = `${portOrOpts}`;
          this.root = null;
          this.localOnly = false;
          this.keepAlive = false;
        } else {
          this.port = '';
          this.root = null;
          this.localOnly = (portOrOpts && portOrOpts.localOnly) || false;
          this.keepAlive = (portOrOpts && portOrOpts.keepAlive) || false;
        }
        break;
      default:
        this.port = '';
        this.root = null;
        this.localOnly = false;
        this.keepAlive = false;
    }
  }

  async start(): Promise<string> {
    if (this.running) {
      return Promise.resolve(this.origin!);
    }

    this.started = true;
    this.running = true;

    // TODO: We probably should to this on iOS as well now.
    if (!this.keepAlive && Platform.OS === 'android') {
      this._appStateSub = AppState.addEventListener(
        'change',
        this._handleAppStateChange.bind(this),
      );
    }

    if (this._configPath) {
      try {
        await RNFS.unlink(this._configPath);
      } catch {
        // Noop.
      }
    }

    let fileDir;
    if (
      this.root &&
      (this.root.startsWith('/') || this.root.startsWith('file:///'))
    ) {
      fileDir = this.root;
    } else {
      fileDir = new URL(this.root!, RNFS.DocumentDirectoryPath).href;
    }

    const hostname = this.localOnly
      ? 'localhost'
      : await FPStaticServer.getLocalIpAddress();

    let port = this.port;
    if (!port || port === '0') {
      port = await FPStaticServer.getOpenPort();
    }

    this._configPath = await generateConfig(fileDir, hostname, port);

    return FPStaticServer.start(
      this.port,
      this.root,
      this.localOnly,
      this.keepAlive,
    ).then(() => {
      this._origin = `http://${hostname}:${port}`;
      return this._origin;
    });
  }

  stop(): Promise<void> {
    this.running = false;
    return FPStaticServer.stop();
  }

  kill() {
    this.stop();
    this.started = false;
    this._origin = undefined;
    if (this._appStateSub) this._appStateSub.remove();
  }

  _handleAppStateChange(appState: AppStateStatus) {
    if (!this.started) {
      return;
    }

    if (appState === 'active' && !this.running) {
      this.start();
    }

    if (appState === 'background' && this.running) {
      this.stop();
    }

    if (appState === 'inactive' && this.running) {
      this.stop();
    }
  }

  get origin() {
    return this._origin;
  }

  isRunning(): Promise<boolean> {
    return FPStaticServer.isRunning().then((running: boolean) => {
      this.running = running;
      return this.running;
    });
  }
}

export default StaticServer;
