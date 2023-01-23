# React Native Static Server

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-native-static-server.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-native-static-server.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/react-native-static-server?style=social)](https://github.com/birdofpreyru/react-native-static-server)

Embed HTTP server for [React Native](https://reactnative.dev) applications.

[![Sponsor](.README/sponsor.png)](https://github.com/sponsors/birdofpreyru)

## Content
- [Project History and Roadmap](#project-history-and-roadmap)
- [Documentation for Older Library Versions (v0.6, v0.5)](./OLD-README.md)
- [Getting Started](#getting-started)
- [Reference](#reference)
- [Migration from Older Versions (v0.6, v0.5)](#migration-from-older-versions-v06-v05)

## Project History and Roadmap

[GCDWebServer]: https://github.com/swisspol/GCDWebServer
[NanoHttpd]: https://github.com/NanoHttpd/nanohttpd
[Lighttpd]: https://www.lighttpd.net
[RN's New Architecture]: https://reactnative.dev/docs/the-new-architecture/landing-page
[RN's Old Architecture]: https://reactnative.dev/docs/native-modules-intro

This project started as a fork of the original
[`react-native-static-server`](https://www.npmjs.com/package/react-native-static-server)
library, abandoned by its creators.
It is published to NPM as
[@dr.pogodin/react-native-static-server](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server),
and it aims to provide a well-maintained embed HTTP server for React Native (RN)
applications.

**These are notable versions of the library:**

- **v0.7.0-alpha.4** &mdash; The aim for upcoming **v0.7** release is to
  migrate from the currently used, and not actively maintained, native server
  implementations ([NanoHttpd] on Android, and [GCDWebServer] on iOS) to
  the same, actively maintained [Lighttpd] sever (current **v1.4.68**) on both
  platforms, and Windows, in perspective. See
  [Issue #12](https://github.com/birdofpreyru/react-native-static-server/issues/12)
  for details.

  Also, library interface will be reworked in this version, with a bunch of
  breaking changes, and library documentation will be enhanced.

  As of the latest alpha version, the status is:
  - **NOT READY FOR PUBLIC USE**, prefer **v0.6.0-alpha.8** or **v0.5.5**,
    described below.
  - **Android**: Migration to [Lighttpd] is completed and tested with RN@0.70,
    [RN's New Architecture], and library version **v0.7.0-alpha.4**. Support of
    [RN's Old Architecture] is also implemented, but is not tested.
  - **iOS**: PoC migration to [Lighttpd] is completed and tested with RN@0.70,
    [RN's Old Architecture], and library version **v0.7.0-alpha.4**. Support of
    [RN's New Architecture] is implemented, but is not tested.
    Current limitations:
    - Only runs on `localhost` (the server is only accessible within an app;
      the `nonLocal` option is not implemented yet, and ignored).
    - Automatic port selection is not implemented yet. A non-zero `port` value
      must be specified to the [constructor()].

- **v0.6.0-alpha.8** &mdash; The aim for upcoming **v0.6** release is
  to refactor the library to support [RN's New Architecture],
  while keeping backward compatibility with [RN's Old Architecture],
  and the original library API. Also, the codebase will be refactored to follow
  the standard RN library template.

  As of the latest alpha version, the status is:
  - The code refactoring is completed.
  - **Android**: relies on [NanoHttpd], tested with RN@0.70, and both
  [RN's New Architecture], and [RN's Old Architecture].
  - **iOS**: reliles on [GCDWebServer], tested with RN@0.70 and
    [RN's Old Architecture]. \
    **NOT TESTED** with [RN's New Architecture], it is likely to require minor
    fixes to support it.

- **v0.5.5** &mdash; The latest version of the original library, patched to work
  with RN@0.67&ndash;0.68, and with all dependencies updated (as of May 17, 2022). Relies
  on [NanoHttpd] on Android, and [GCDWebServer] on iOS; only supports
  [RN's Old Architecture], and was not tested with RN@0.69+.

## Documentation for Older Library Versions (v0.6, v0.5)
See [OLD-README.md](./OLD-README.md)

## Usage Instructions

_This is a very raw draft, it will be elaborated later._

[CMake]: https://cmake.org

- [CMake] is required on the build host.
  - On **MacOS** you may get it by installing [Homebrew](https://brew.sh),
    then executing
    ```shell
    $ brew install cmake
    ```

- Install the package
  ```shell
  $ npm install --save @dr.pogodin/react-native-static-server
  ```
- For **Android**:
  - In the `build.gradle` file set `minSdkVersion` equal 28
    ([SDK 28 &mdash; Android 9](https://developer.android.com/studio/releases/platforms#9.0),
    released in August 2018), or larger.

- For **iOS**:
  - After installing the package, enter `ios` folder of the app's codebase
    and execute
    ```shell
    $ pod install
    ```

- For [Expo](https://expo.dev): \
  _It probably works with some additional setup (see
  [Issue#8](https://github.com/birdofpreyru/react-native-static-server/issues/8)),
  however at the moment we don't support it officially. If anybody wants
  to help with this, contributions to the documentation / codebase are welcome._

- Create and run server instance:
  ```js
  import Server from '@dr.pogodin/react-native-static-server';

  // NOTE: In practice, you probably want to create and persitently keep
  // server instance within a RN component, presumably using useRef() hook,
  // so this example should be enhanced to demonstrate it.

  const server = new Server({
    // See further in the docs how to statically bundle assets into the App,
    // alternatively assets to server might be created or downloaded during
    // the app's runtime.
    fileDir: '/path/to/static/assets/on/target/device',
  });

  // As BEWARE note below says, you may have multiple Server instances around,
  // but you MUST NOT start more than one instance a time, i.e. before calling
  // .start() on an instance you MUST .stop() a previously started instance,
  // if any.
  server.start().then((origin) => {
    console.log(`Serving at URL ${url}`);
  });
  ```

- Add files to serve into your app bundle (this is use-case and OS-dependable,
  should be explained into details).
  - _TODO: Bundling assets in Android_
  - _TODO: Bundling assets in iOS_

## Reference
- [extractBundledAssets()] &mdash; Extracts bundled assets into a regular folder
  (Android-specific).
- [getActiveServer()] &mdash; Gets currently active, starting, or stopping
  server instance, if any.
- [Server] &mdash; Represents a server instance.
  - [constructor()] &mdash; Creates a new [Server] instance.
  - [.addStateListener()] &mdash; Adds state listener to the server instance.
  - [.start()] &mdash; Launches the server.
  - [.stop()] &mdash; Stops the server.
  - [.fileDir] &mdash; Holds absolute path to static assets on target device.
  - [.hostname] &mdash; Holds the hostname used by server.
  - [.nonLocal] &mdash; Holds `nonLocal` value provided to [constructor()].
  - [.origin] &mdash; Holds server origin.
  - [.port] &mdash; Holds the port used by server.
  - [.state] &mdash; Holds the current server state.
  - [.stopInBackground] &mdash; Holds `stopInBackground` value provided to
    [constructor()].
- [STATES] &mdash; Enumerates possible states of [Server] instance.

### extractBundledAssets()
[extractBundledAssets()]: #extractbundledassets
```jsx
import {extractBundledAssets} from '@dr.pogodin/react-native-static-server';

extractBundledAssets(into, from): Promise<>;
```
Extracts bundled assets into the specified regular folder, preserving asset
folder structure, and overwriting any conflicting files in the destination.

This is an Android-specific function; it does nothing on other platforms.

**Arguments**
- `into` &mdash; **string** &mdash; Optional. The destination folder for
  extracted assets. By default assets are extracted into the app's document
  folder.
- `from` &mdash; **string** &mdash; Optional. Relative path to the root asset
  folder, starting from which all assets contained in that folder and its
  sub-folders will be extracted into the destination folder, preserving asset
  folder structure. By default all bundled assets are extracted.

**Returns** [Promise] which resolves once the extraction is completed.

### getActiveServer()
[getActiveServer()]: #getactiveserver
```js
import {getActiveServer} from '@dr.pogodin/react-native-static-server';

getActiveServer(): Server;
```
Returns currently active, starting, or stopping [Server] instance, if any exist
in the app. It does not return, however, any inactive server instance which has
been stopped automatically because of `stopInBackground` option, when the app
entered background, and might be automatically started in future if the app
enters foreground again prior to an explicit [.stop()] call for that instance.

### Server
[Server]: #server
```js
import Server from '@dr.pogodin/react-native-static-server';
```
The [Server] class represents individual server instances.

**BEWARE:** On **Android** and **iOS** at most one server instance can be active
within an app at the same time. Attempts to start a new server instance will
result in the crash of that new instance. That means, although you may have
multiple instances of [Server] class created, you should not call [.start()]
method of an instance unless all other server instances are stopped. You may
use [getActiveServer()] function to check if there is any active server instance
in the app, including a starting or stopping instance.

#### constructor()
[constructor()]: #constructor
```ts
const server = new Server(options: object);
```
Creates a new, inactive server instance. The following settings are supported
within `options` argument:

- `fileDir` &mdash; **string** &mdash; The root path on target device from where
  static assets should be served. Relative paths (those not starting with `/`,
  neither `file:///`) will be automatically prepended by the _document directory_
  path; however, empty `fileDir` value is forbidden: if you really want to serve
  entire documents directory of the app, provide its absolute path explicitly.

- `nonLocal` &mdash; **boolean** &mdash; By default, the server is started on
  `localhost` address, and it is only accessible within the app. With this flag
  set **true** the server will be started on a local IP adress also accessible
  from outside the app.

- `port` &mdash; **number** &mdash; The port at which to start the server.
  If 0 (default) an available port will be automatically selected.

- `stopInBackground` &mdash; **boolean** &mdash; By default, server intents
  to keep working as usual when app enters background / returns to foreground.
  Setting this flag **true** will cause an active server to automatically stop
  each time the app transitions to background, and then automatically restart
  once the app re-enters foreground. Note that calling [.stop()] explicitly
  will stop the server for good&nbsp;&mdash; no matter `stopInBackground` value;
  once [.stop()] is called the server won't restart automatically unless you
  explicitly [.start()] it again.

#### .addStateListener()
[.addStateListener()]: #addstatelistener
```ts
server.addStateListener(listener: callback): function;
```
Adds given state listener to the server instance. The listener will be called
each time the server state changes with a single argument passed in, the new
state, which will be one of [STATES] values.

This method also returns "unsubscribe" function, call it to remove added
listener from the server instance.

#### .start()
[.start()]: #start
```ts
server.start(): Promise<string>
```
Starts [Server] instance. It returns a [Promise], which resolves
to the server's [origin][.origin] once the server reaches `ACTIVE`
[state][.state], thus becomes ready to handle requests. The promise rejects
in case of start failure, _i.e._ if server ends up in the `CRASHED` state before
becoming `ACTIVE`.

This method is safe to call no matter the current state of this server instance.
If it is `ACTIVE`, the method just resolves to [origin][.origin] right away;
if `CRASHED`, it attempts a new start of the server; otherwise (`STARTING` or
`STOPPING`), it will wait until the server reaches one of resulting states
(`ACTIVE`, `CRASHED`, or `INACTIVE`), then acts accordingly.

**BEWARE:** With the current library version, at most one server instance can be
active within an app at any time. Calling [.start()] when another server instance
is running will result in the start failure and `CRASHED` state. See also
[getActiveServer()].

#### .stop()
[.stop()]: #stop
```ts
server.stop(): Promise<>
```
Gracefully shuts down the server. It returns a [Promise] which resolve once
the server is shut down, _i.e._ reached `INACTIVE` [state](.state). The promise
rejects if an error happens during shutdown, and server ends up in the `CRASHED`
state.

If server was created with `pauseInBackground` option, calling
`.stop()` will also ensure that the stopped server won't be restarted when
the app re-enters foreground. Once stopped, the server only can be re-launched
by an explicit call of [.start()].

It is safe to call this method no matter the current state of this server.
If it is `INACTIVE` or `CRASHED`, the call will just cancel automatic restart
of the server, if one is scheduled by `pauseInBackground` option, as mentioned
above. If it is `STARTING` or `STOPPING`, this method will wait till server
reaching another state (`ACTIVE`, `INACTIVE` or `CRASHED`), then it will act
accordingly.

#### .fileDir
[.fileDir]: #filedir
```ts
server.fileDir: string;
```
Readonly property. It holds `fileDir` value &mdash; the absolute path
on target device from which static assets are served by the server.

#### .hostname
[.hostname]: #hostname
```ts
server.hostname: string;
```
Readonly property. It holds hostname used by the server. If server instance
was constructed without `nonLocal` option (default), the `.hostname` property
will equal "`localhost`" from the beginning. Otherwise, it will be empty string
till the first launch of server instance, after which it will be equal to IP
address automatically selected for the server. This IP address won't change
upon subsequent re-starts of the server.

#### .nonLocal
[.nonLocal]: #nonlocal
```ts
server.nonLocal: boolean;
```
Readonly property. It holds `nonLocal` value provided to server [constructor()].

#### .origin
[.origin]: #origin
```ts
server.origin: string;
```
Readonly property. It holds server origin. Initially it equals empty string,
and after the first launch of server instance it becomes equal to its origin,
_i.e._ "`http://HOSTNAME:PORT`", where `HOSTNAME` and `PORT` are selected
hostname and port, also accessible via [.hostname] and [.port] properties.

#### .port
[.port]: #port
```ts
server.port: number;
```
Readonly property. It holds the port used by the server. Initially it equals
the `port` value provided to [constructor()], or 0 (default value), if it was
not provided. If it is 0, it will change to the automatically selected port
number once the server is started the first time. The selected port number
does not change upon subsequent re-starts of the server.

#### .state
[.state]: #state
```ts
server.state: STATES;
```
Readonly property. It holds current server state, which is one of [STATES]
values. Use [.addStateListener()] method to watch for server state changes.

#### .stopInBackground
[.stopInBackground]: #stopinbackground
```ts
server.stopInBackground: boolean;
```
Readonly property. It holds `stopInBackground` value provided to [constructor()].

### STATES
[STATES]: #states
```js
import {STATES} from '@dr.pogodin/react-native-static-server';
```
The [STATES] enumerator provides possible states of a server instance:
- `STATES.ACTIVE` &mdash; Up and running.
- `STATES.CRASHED` &mdash; Crashed and inactive.
- `STATES.INACTIVE` &mdash; Yet not started, or gracefully shut down.
- `STATES.STARTING` &mdash; Starting up.
- `STATES.STOPPING` &mdash; Shutting down.

## Migration from Older Versions (v0.6, v0.5)

- On **Android** it now requires `minSdkVersion` to be set in equal 28 or larger
  (in `build.gradle` file). Also, now it is not supported to start more than one
  server instance a time (previously started server instance, if any, must be
  stopped before starting another one).

- [Server]'s [constructor()] signature was changed, as well as default behavior:
  - [constructor()] now accepts a single required argument: an object holding
    all available server options:
  - `fileDir` option replaces old `root` argument, and now it MUST BE
    a non-empty string (to prevent any mistakes due to wrong assumptions
    what folder is served by default).
  - `nonLocal` option replaces the old `localOnly`  option, with the opposite
    meaning and default behavior. Now, by default the server is started on
    "`localhost`" and is only accessible from within the app. Setting `nonLocal`
    flag will start it on an automatically assigned IP, accessible from outside
    the app as well. This is the opposite to behavior in previous versions, and
    it feels more secure (prevents exposing server outside the app due to
    overlooking the default behavior).
  - `stopInBackground` option replaces the old `keepAlive` option, with
    the opposite meaning and behavior. Now, by default the server does not
    do anything special when the app goes into background / returns to foreground.
    Setting `stopInBackground` **true** will cause automatic stop of the server
    each time the app enters background, with subsequent automatic server restart
    when the app returns to foreground. This is opposite to behavior in previous
    versions, and the rationale is: it is easy to handle the server without
    stopping in background (in this case there is no need to watch server state
    and synchronize possible requests with current server state), thus new
    default behavior allows for easier server usage, while the opt-in stopping
    of server in background allows more advanced usage scenario.

- The new server implementation relies on app's temporary data folder to store
  some internal files (all within its `__rn-static-server__` subfolder), don't
  mess with it if you do anything special with the temporary folder.

[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
