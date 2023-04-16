// Encapsulates the standard Lighttpd configuration for the library.

import RNFS from 'react-native-fs';

/**
 * Filesystem location where the library will keep its working files (configs,
 * logs, uploads) for the app.
 */
export const WORK_DIR = `${RNFS.TemporaryDirectoryPath}/__rn-static-server__`;

/**
 * Filesystem location for the error log file.
 */
export const ERROR_LOG_FILE = `${WORK_DIR}/errorlog.txt`;

/**
 * Filesystem locations where the library will keep uploads for the app.
 */
export const UPLOADS_DIR = `${WORK_DIR}/uploads`;

/**
 * Options for error log, they mirror debug options of Lighttpd config:
 * https://redmine.lighttpd.net/projects/lighttpd/wiki/DebugVariables
 */
export type ErrorLogOptions = {
  conditionCacheHandling?: boolean;
  conditionHandling?: boolean;
  fileNotFound?: boolean;
  requestHandling?: boolean;
  requestHeader?: boolean;
  requestHeaderOnError?: boolean;
  responseHeader?: boolean;
  sslNoise?: boolean;
  timeouts?: boolean;
};

/**
 * Options for the standard Lighttpd configuration for the library.
 */
export type StandardConfigOptions = {
  errorLog?: ErrorLogOptions;
  fileDir: string;
  hostname: string;
  port: number;
};

/**
 * Generates a fragment of Lighttpd config related to error and debug logging.
 * @param errorLogOptions
 * @returns
 */
function errorLogConfig(errorLogOptions?: ErrorLogOptions): string {
  const res = [];

  if (errorLogOptions) {
    const ops: ErrorLogOptions = errorLogOptions;
    const enable = (op: string) => {
      res.push(`debug.log-${op} = "enable"`);
    };

    if (ops.conditionCacheHandling) enable('condition-cache-handling');
    if (ops.conditionHandling) enable('condition-handling');
    if (ops.fileNotFound) enable('file-not-found');
    if (ops.requestHandling) enable('request-handling');
    if (ops.requestHeader) enable('request-header');
    if (ops.requestHeaderOnError) enable('request-header-on-error');
    if (ops.responseHeader) enable('response-header');
    if (ops.sslNoise) enable('ssl-noise');
    if (ops.timeouts) enable('timeouts');
  } else res.push('server.errorlog-use-syslog = "enable"');

  return res.join('\n');
}

/**
 * Generates the standard Lighttpd config.
 * @param param0
 * @returns
 */
function standardConfig({
  errorLog,
  fileDir,
  hostname,
  port,
}: StandardConfigOptions) {
  return `server.document-root = "${fileDir}"
  server.bind = "${hostname}"
  server.upload-dirs = ( "${UPLOADS_DIR}" )
  server.port = ${port}
  ${errorLogConfig(errorLog)}
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
  )`;
}

/**
 * Creates a new file with the standard Lighttpd configuration in the WORK_DIR,
 * and returns resolves to its path.
 * @param fileDir
 * @param hostname
 * @param port
 * @return {Promise<string>} Resolves to the name of the created config file.
 */
export async function newStandardConfigFile(
  options: StandardConfigOptions,
): Promise<string> {
  // NOTE: Lighttpd exits with error right away if the specified uploads
  // directory does not exist.
  await RNFS.mkdir(UPLOADS_DIR);

  const configFile = `${WORK_DIR}/config-${Date.now()}.txt`;
  await RNFS.writeFile(configFile, standardConfig(options), 'utf8');
  return configFile;
}
