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

- **v0.7.0-alpha.1** &mdash; The aim for upcoming **v0.7.0** release is to
  migrate from the currently used, and not actively maintained, native server
  implementations ([GCDWebServer](https://github.com/swisspol/GCDWebServer) on
  iOS, and [NanoHttpd](https://github.com/NanoHttpd/nanohttpd) on Android) to
  the same, actively maintained [Lighttpd] sever on both platforms (and Windows
  in perspective). See
  [Issue #12](https://github.com/birdofpreyru/react-native-static-server/issues/12)
  for details.

  Also, library interface will be reworked in this version, with a bunch of
  breaking changes, and library documentation will be enhanced.

  As of the latest alpha version, the status is:
  - **NOT READY FOR PUBLIC USE**, prefer **v0.6.0-alpha.8** or **v0.5.5**,
    described below.
  - PoC migration to [Lighttpd] is completed for **Android**,
    both with [RN's New Architecture] and [RN's Old Architecture].
    It needs further testing.
  - **iOS** version is broken.

- **v0.6.0-alpha.8** &mdash; The aim for upcoming **v0.6.0** release is
  to refactor the library to support [RN's New Architecture],
  while keeping backward compatibility with [RN's Old Architecture],
  and the original library API. Also, the codebase will be refactored to follow
  the standard RN library template.

  As of the latest alpha version, the status is:
  - The code refactoring is completed.
  - The outcome is tested and works with [RN's Old Architecture] both on
    **Android** and **iOS** devices.
  - The outcome is tested to work with [RN's New Architecture] on **Android**,
    when using RN@0.70.
  - **NOT YET TESTED** with [RN's New Architecture] on **iOS**. Likely to need
    minor fixes there. 

- **v0.5.5** &mdash; Almost exact close copy of the latest version of
  the original library, patched to work with React Native v0.67+,
  and with all dependencies updated (as of May 17, 2022).

## Documentation for Older Library Versions (v0.6, v0.5)
See [OLD-README.md](./OLD-README.md)

## Usage Instructions

_This is a very raw draft, it will be elaborated later._

- Install the package
  ```shell
  $ npm install --save @dr.pogodin/react-native-static-server
  ```
- Add files to serve into your app bundle (this is use-case and OS-dependable,
  should be explained into details).
  - _TODO: Bundling assets in Android_
  - _TODO: Bundling assets in iOS_
  
- Create and run server instance.
  ```js
  import Server from '@dr.pogodin/react-native-static-server';

  // NOTE: In practice, you probably want to create and persitently keep
  // server instance within a RN component, presumably using useRef() hook,
  // so this example should be enhanced to demonstrate it.

  const server = new Server({
    fileDir: '/path/to/static/assets/on/target/device',
  });

  server.start().then((origin) => {
    console.log(`Serving at URL ${url}`);
  });
  ```

  **BEWARE**: With the current implementation of **v0.7** versions no more
  than a single server instance can be active at time. Attempt to start a new
  server instance while another one is still active will result in the crash of
  that new instance.

- _To use it in Expo app some more setup is needed, to be elaborated._

## Reference
- [STATES] &mdash; Enumerates possible states of [Server] instance.
- [Server] &mdash; Represents a server instance.
  - [constructor()] &mdash; Creates a new [Server] instance.
  - [.addStateListener()] &mdash; Adds state listener to the server instance.
  - [.start()] &mdash; Launches the server.

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
Creates a new inactive server instance. The following settings are supported
as fields/values of `options` argument:

- `fileDir` &mdash; **string** &mdash; The root path on target device from where
  static assets should be served by the server. Relative paths (those not starting
  with `/`, neither `file:///`) will be automatically prepended by the
  _document directory path_. If options is not provided,
  the _document directory path_ will be used as `fileDir`.

  **NOTE:** That last behavior (undefined `fileDir`) does not feel
  that secure, on a second thought, it will be probably dissalowed.

- `localhost` &mdash; **boolean** &mdash; If **true** (default) the server will
  bind to the localhost address, and will be accessible within the app only.
  Otherwise, it will be bind to a local IP address, and accessible across apps
  on the device.

- `pauseInBackground` &mdash; **boolean** &mdash; If **true** (default)
  the server will be automatically inactivated each time the app enters
  background, and re-activated once the app is in foreground again.

- `port` &mdash; **number** &mdash; The port to start the server at.
  If 0 (default) an available port will be automatically selected.

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

_TODO:_ These properties are currently available on the server
instance, but it will be likely reconsidered.

#### .fileDir
#### .hostname
#### .origin
#### .pauseInBackground
#### .port
#### .state

## Migration from Older Versions (v0.6, v0.5)

_TODO: This will be written later, as the current interface is likely to change further._
