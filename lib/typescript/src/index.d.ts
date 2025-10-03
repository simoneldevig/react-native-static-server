import { type AppStateStatus, type NativeEventSubscription } from "react-native";
import { Emitter, Semaphore } from "@dr.pogodin/js-utils";
import { type ErrorLogOptions } from "./config";
import { STATES } from "./constants";
import { resolveAssetsPath } from "./utils";
export { ERROR_LOG_FILE, UPLOADS_DIR, WORK_DIR } from "./config";
export { STATES, resolveAssetsPath };
export type StateListener = (newState: STATES, details: string, error?: Error) => void;
declare class StaticServer {
    _appStateSub?: NativeEventSubscription;
    _configPath?: string;
    _errorLog?: ErrorLogOptions;
    _extraConfig: string;
    _fileDir: string;
    _hostname: string;
    _nonLocal: boolean;
    _origin: string;
    _stopInBackground: boolean;
    _port: number;
    _state: STATES;
    _stateChangeEmitter: Emitter<[STATES, string, Error | undefined]>;
    _id: number;
    _sem: Semaphore;
    _webdav: string[] | undefined;
    get errorLog(): false | ErrorLogOptions;
    get fileDir(): string;
    get hostname(): string;
    get id(): number;
    /** @deprecated */
    get nonLocal(): boolean;
    get origin(): string;
    get stopInBackground(): boolean;
    get port(): number;
    get state(): STATES;
    _setState(neu: STATES, details?: string, error?: Error): void;
    /**
     * Creates a new Server instance.
     */
    constructor({ errorLog, extraConfig, fileDir, hostname, id, nonLocal, port, state, stopInBackground, webdav, }: {
        extraConfig?: string;
        errorLog?: boolean | ErrorLogOptions;
        fileDir: string;
        hostname?: string;
        id?: number;
        nonLocal?: boolean;
        port?: number;
        state?: STATES;
        stopInBackground?: boolean;
        webdav?: string[];
    });
    addStateListener(listener: StateListener): () => void;
    _configureAppStateHandling(): void;
    _removeConfigFile(): Promise<void>;
    _registerSelf(): void;
    /**
     * This method throws if server is not in a "stable" state, i.e. not in one
     * of these: ACTIVE, CRASHED, INACTIVE.
     */
    _stableStateGuard(): void;
    /**
     * Removes all state listeners connected to this server instance.
     */
    removeAllStateListeners(): void;
    /**
     * Removes given state listener, if it is connected to this server instance;
     * or does nothing if the listener is not connected to it.
     * @param listener
     */
    removeStateListener(listener: StateListener): void;
    /**
     * @param {string} [details] Optional. If provided, it will be added
     * to the STARTING message emitted to the server state change listeners.
     * @returns {Promise<string>}
     */
    start(details?: string): Promise<string>;
    /**
     * Soft-stop the server: if automatic pause for background is enabled,
     * it will be automatically reactivated when the app goes into foreground
     * again. End users are expected to use public .stop() method below, which
     * additionally cleans-up that automatic re-activation.
     * @param {string} [details] Optional. If provided, it will be added
     *  to the STOPPING message emitted to the server state change listeners.
     * @returns {Promise<>}
     */
    _stop(details?: string): Promise<void>;
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
    stop(details?: string): Promise<void>;
    _handleAppStateChange(appState: AppStateStatus): Promise<void>;
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
export declare function extractBundledAssets(into?: string, from?: string): Promise<void>;
/**
 * Returns a set of server instance currently being in ACTIVE, STARTING,
 * or STOPPING state, if such server instances exists.
 * @return {Set<StaticServer>|undefined}
 */
export declare function getActiveServerSet(): Set<StaticServer> | undefined;
/**
 * Returns a server instance currently being in ACTIVE, STARTING,
 * or STOPPING state, if such server instance exists.
 * @return {StaticServer|undefined}
 */
export declare function getActiveServer(): StaticServer | undefined;
export declare const getActiveServerId: () => Promise<number | null>;
//# sourceMappingURL=index.d.ts.map