import {
  AppState,
  type AppStateStatus,
  NativeEventEmitter,
  type NativeEventSubscription,
  Platform,
} from 'react-native';

import RNFS from 'react-native-fs';

import { Emitter, Semaphore } from '@dr.pogodin/js-utils';

import {
  ERROR_LOG_FILE,
  newStandardConfigFile,
  type ErrorLogOptions,
} from './config';

import { SIGNALS, STATES } from './constants';
import ReactNativeStaticServer from './ReactNativeStaticServer';

export { ERROR_LOG_FILE, UPLOADS_DIR, WORK_DIR } from './config';

export { STATES };

// ID-to-StaticServer map for all potentially active server instances,
// used to route native events back to JS server objects.
const servers: { [id: string]: StaticServer } = {};

const nativeEventEmitter = new NativeEventEmitter(ReactNativeStaticServer);

const LOOPBACK_ADDRESS = '127.0.0.1';

export type StateListener = (
  newState: STATES,
  details: string,
  error?: Error,
) => void;

nativeEventEmitter.addListener(
  'RNStaticServer',
  ({ serverId, event, details }) => {
    const server = servers[serverId];
    if (server) {
      switch (event) {
        case SIGNALS.CRASHED:
          // TODO: We probably can, and should, capture the native stack trace
          // and pass it along with the error.
          const error = Error(details);
          server._setState(STATES.CRASHED, details, error);
          // TODO: Should we do here the following?
          // delete servers[this._id];
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
  _errorLog?: ErrorLogOptions;
  _fileDir: string;
  _hostname = '';

  /* DEPRECATED */ _nonLocal: boolean;

  _origin: string = '';
  _stopInBackground: boolean;
  _port: number;

  _state: STATES = STATES.INACTIVE;
  _stateChangeEmitter = new Emitter<[STATES, string, Error | undefined]>();

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

  get errorLog(): false | ErrorLogOptions {
    return this._errorLog || false;
  }

  get fileDir() {
    return this._fileDir;
  }

  get hostname() {
    return this._hostname;
  }

  get id() {
    return this._id;
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

  _setState(neu: STATES, details: string = '', error?: Error) {
    this._state = neu;
    this._stateChangeEmitter.emit(neu, details, error);
  }

  /**
   * Creates a new Server instance.
   */
  constructor({
    errorLog = false,
    fileDir,
    hostname,

    /* DEPRECATED */ nonLocal = false,

    port = 0,
    stopInBackground = false,
  }: {
    errorLog?: boolean | ErrorLogOptions;
    fileDir: string;
    hostname?: string;

    /* DEPRECATED */ nonLocal?: boolean;

    port?: number;
    stopInBackground?: boolean;
  }) {
    if (errorLog) this._errorLog = errorLog === true ? {} : errorLog;

    this._nonLocal = nonLocal;
    this._hostname = hostname || (nonLocal ? '' : LOOPBACK_ADDRESS);

    this._port = port;
    this._stopInBackground = stopInBackground;

    if (!fileDir) throw Error('`fileDir` MUST BE a non-empty string');
    else if (!isAbsolutePath(fileDir)) {
      fileDir = `${RNFS.DocumentDirectoryPath}/${fileDir}`;
    }
    this._fileDir = fileDir;
  }

  addStateListener(listener: StateListener) {
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
    if (this._configPath) {
      const p = this._configPath;

      // Resetting the field prior to the async unlink attempt is safer,
      // in case the caller does not await for this method to complete.
      this._configPath = undefined;

      try {
        await RNFS.unlink(p);
      } catch {
        // IGNORE
      }
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
   * Removes all state listeners connected to this server instance.
   */
  removeAllStateListeners() {
    this._stateChangeEmitter.removeAllListeners();
  }

  /**
   * Removes given state listener, if it is connected to this server instance;
   * or does nothing if the listener is not connected to it.
   * @param listener
   */
  removeStateListener(listener: StateListener) {
    this._stateChangeEmitter.removeListener(listener);
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
        this._port = await ReactNativeStaticServer.getOpenPort(this._hostname);
      }
      this._origin = `http://${this._hostname}:${this._port}`;

      await this._removeConfigFile();
      this._configPath = await newStandardConfigFile({
        errorLog: this._errorLog,
        fileDir: this._fileDir,
        hostname: this._hostname,
        port: this._port,
      });

      // Native implementations of .start() method must resolve only once
      // the server has been launched (ready to handle incoming requests).
      await ReactNativeStaticServer.start(
        this._id,
        this._configPath,
        this._errorLog ? ERROR_LOG_FILE : '',
      );

      this._setState(STATES.ACTIVE);
      this._removeConfigFile();
      return this._origin;
    } catch (e: any) {
      const error = e instanceof Error ? e : Error(e.message, { cause: e });
      this._setState(STATES.CRASHED, error.message, error);
      throw error;
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

      // Native implementations of .stop() method must resolve only once
      // the server has been completely shut down (released the port it listens).
      await ReactNativeStaticServer.stop();
      this._setState(STATES.INACTIVE);
    } catch (e: any) {
      const error = e instanceof Error ? e : Error(e.message, { cause: e });
      this._setState(STATES.CRASHED, error.message, error);
      throw error;
    } finally {
      delete servers[this._id];
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
