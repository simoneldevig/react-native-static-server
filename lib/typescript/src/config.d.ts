/**
 * Filesystem location where the library will keep its working files (configs,
 * logs, uploads) for the app.
 */
export declare const WORK_DIR: string;
/**
 * Filesystem location for the error log file.
 */
export declare const ERROR_LOG_FILE: string;
/**
 * Filesystem locations where the library will keep uploads for the app.
 */
export declare const UPLOADS_DIR: string;
/**
 * Options for error log, they mirror debug options of Lighttpd config:
 * https://redmine.lighttpd.net/projects/lighttpd/wiki/DebugVariables
 */
export type ErrorLogOptions = {
    conditionHandling?: boolean;
    fileNotFound?: boolean;
    requestHandling?: boolean;
    requestHeader?: boolean;
    requestHeaderOnError?: boolean;
    responseHeader?: boolean;
    timeouts?: boolean;
};
/**
 * Options for the standard Lighttpd configuration for the library.
 */
export type StandardConfigOptions = {
    errorLog?: ErrorLogOptions;
    extraConfig: string;
    fileDir: string;
    hostname: string;
    port: number;
    webdav?: string[];
};
/**
 * Creates a new file with the standard Lighttpd configuration in the WORK_DIR,
 * and returns resolves to its path.
 * @param fileDir
 * @param hostname
 * @param port
 * @return {Promise<string>} Resolves to the name of the created config file.
 */
export declare function newStandardConfigFile(options: StandardConfigOptions): Promise<string>;
//# sourceMappingURL=config.d.ts.map