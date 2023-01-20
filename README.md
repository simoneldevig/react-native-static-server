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
  the same, actively maintained [Lighttpd] sever on both platforms, and Windows,
  in perspective. See
  [Issue #12](https://github.com/birdofpreyru/react-native-static-server/issues/12)
  for details.

  Also, library interface will be reworked in this version, with a bunch of
  breaking changes, and library documentation will be enhanced.

  As of the latest alpha version, the status is:
  - **NOT READY FOR PUBLIC USE**, prefer **v0.6.0-alpha.8** or **v0.5.5**,
    described below.
  - **Android**: Migration to [Lighttpd] is completed and tested with RN@0.70,
  - [RN's New Architecture], and library version **v0.7.0-alpha.4**. Support of
    [RN's Old Architecture] is also implemented, but is not tested.
  - **iOS**: PoC migration to [Lighttpd] is work in progress.
    As of **v0.7.0-alpha.3** it is missing a few pieces, but it was tested
    with RN@0.70 and [RN's Old Architecture], and it looked functional, but
    also could be broken during further code preparation for the alpha release.
    Support of [RN's New Architecture] was also implemented, but not tested.
  - **v1.4.68** (latest) version of [Lighttpd] is used.

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
  with RN@0.67+, and with all dependencies updated (as of May 17, 2022). Relies
  on [NanoHttpd] on Android, and [GCDWebServer] on iOS; only supports
  [RN's Old Architecture], and was not tested with RN@0.69+.

## Documentation for Older Library Versions (v0.6, v0.5)
See [OLD-README.md](./OLD-README.md)

## Usage Instructions

_This is a very raw draft, it will be elaborated later._

- Install the package
  ```shell
  $ npm install --save @dr.pogodin/react-native-static-server
  ```
- For **Android**:
  - In `build.gradle` file set `minSdkVersion` to the value 28 or larger. \
    _Note: older SDK versions miss some functions / libraries we rely upon.
    Technically, we can support them if we bundle-in those missing pieces into
    this library; in practice, if nobody sponsors this task, the need to support
    older SDKs looks low (mind that
    [SDK 28 &mdash; Android 9](https://developer.android.com/studio/releases/platforms#9.0)
    is with us since August 2018)._

- For **iOS**:
  - [CMake](https://cmake.org) is required on the build host. The easiest way
    to get it is to install [Homebrew](https://brew.sh), then execute:
    ```shell
    $ brew install cmake
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

  **BEWARE**: With the current implementation of **v0.7** versions no more
  than a single server instance can be active at time. Attempt to start a new
  server instance while another one is still active will result in the crash of
  that new instance.

- Add files to serve into your app bundle (this is use-case and OS-dependable,
  should be explained into details).
  - _TODO: Bundling assets in Android_
  - _TODO: Bundling assets in iOS_

## Reference
- [STATES] &mdash; Enumerates possible states of [Server] instance.
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

### STATES
[STATES]: #states
```js
import {STATES} from '@dr.pogodin/react-native-static-server';
```
The [STATES] enumerator provides possible states of a server instance:
- `STATES.ACTIVE` &mdash; The server instance is up and running;
- `STATES.CRASHED` &mdash; The server instance has crashed and is inactive;
- `STATES.INACTIVE` &mdash; The server instance is shut down;
- `STATES.STARTING` &mdash; The server instance is starting up;
- `STATES.STOPPING` &mdash; The server instance is shutting down.

_TODO: Move these state behavior description to [.start()] and [.stop()] docs._

Upon creation, a new server instance is in `INACTIVE` state. Calling [.start()]
will immediately move it to `STARTING` state, and then to `ACTIVE` state once
the server is fully initiated in the native layer and is ready to handle
requests.

When [.stop()] is called on `ACTIVE` server, or app enters background when
a server created with `stopInBackground` option is `ACTIVE`, the server moves
to `STOPPING` state, and it becomes `INACTIVE` once it is confirmed to fully
stop within the native layer. The server automatically stopped because of
`stopInBackground` option will automatically restart once the app enters
foreground, and state changes will be the same as for its regular [.start()]
sequence described above.

It is legit to call [.stop()] on `INACTIVE` server &mdash; if server was stopped
due to `stopInBackground` option and intends to automatically restart once
the app is in foreground, calling [.stop()] will cancel such restart, and
ensure that only explicit call to [.start()] will launch this server again.

If any error at any time happens to server, either within native, or Java,
or JavaScript layers, the server instance will terminate and move to `CRASHED`
state. You may try to restart such instance calling [.start()] and if succeed,
the state changes will follow the regular start sequence.

### Server
[Server]: #server
```js
import Server from '@dr.pogodin/react-native-static-server';
```
The [Server] class instances represent individual server instances.

**BEWARE:** As of the current (**v0.7+**) library implementations at most one
server instance can be active at time. Attempts to start a new server instance
will result in crash of that new instance. That means, although you may have
multiple instance of [Server] class created, you should not call an instance
[.start()] method unless all other server instances are stopped.

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
  will stop the server for good &mdash; no matter `stopInBackground` value,
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
Launches [Server] instance. It returns a Promise, which resolves to the server
origin once the server is ready to handle requests (the origin is the URL at
which the server is bound, _e.g._ "http://localhost:3000").
See [STATES] documentation for details of possible server states and transitions
between them.

_TODO_: The state changes, as well as function behavior in different states should be documented here, rather than in [STATES].

#### .stop()
[.stop()]: #stop
```ts
server.stop(): Promise<>
```
Shuts down the [Server].

**NOTE**: When server was created with `pauseInBackground` option (default),
calling `.stop()` also ensures that the stopped server won't be restarted
when the app re-enters foreground. Once stopped, the server only can be
re-launched by explicity call to [.start()].

_TODO_: The state changes, as well as function behavior in different states should be documented here, rather than in [STATES].

#### .fileDir
[.fileDir]: #filedir
```ts
server.fileDir: string;
```
**Readonly** property, it holds `fileDir` value &mdash; the absolute path
on target device from which static assets are served by the server.

#### .hostname
[.hostname]: #hostname
```ts
server.hostname: string;
```
**Readonly** property, it holds hostname used by the server. If server instance
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
**Readonly** property, it holds `nonLocal` value provided to server
[constructor()].

#### .origin
[.origin]: #origin
```ts
server.origin: string;
```
**Readonly** property, it holds server origin. Initially it equals empty string,
and after the first launch of server instance it becomes equal to its origin,
_i.e._ "`http://HOSTNAME:PORT`", where `HOSTNAME` and `PORT` are selected hostname
and port, also accessible via [.hostname] and [.port] properties.

#### .port
[.port]: #port
```ts
server.port: number;
```
**Readonly** property, it holds the port used by the server. Initially it equals
the `port` value provided to [constructor()], or 0 (default value), if it was
not provided. If it is 0, it will change to the automatically selected port
number once the server is started the first time. The selected port number
does not change upon subsequent re-starts of the server.

#### .state
[.state]: #state
```ts
server.state: STATES;
```
**Readonly** property, it holds current server state, which is one of [STATES]
values.

#### .stopInBackground
[.stopInBackground]: #stopinbackground
```ts
server.stopInBackground: boolean;
```
**Readonly** property, it holds `stopInBackground` value provided to
[constructor()].

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
