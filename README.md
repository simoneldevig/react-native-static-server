# React Native Static Server

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-native-static-server.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-native-static-server.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/react-native-static-server?style=social)](https://github.com/birdofpreyru/react-native-static-server)

Embed HTTP server for [React Native](https://reactnative.dev) applications.

[![Sponsor](.README/sponsor.png)](https://github.com/sponsors/birdofpreyru)

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

- **v0.7.0-alpha.0** &mdash; The aim for upcoming **v0.7.0** release is to
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
  - **NOT READY FOR PRODUCTION USE**, prefer **v0.6.0-alpha.8** or **v0.5.5**,
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

## Getting started
- Install the package
  ```shell
  $ npm install --save @dr.pogodin/react-native-static-server
  ```
- If you intend to use this library in an [Expo app](https://expo.dev),
  it is possible, but requires additional setup efforts.
  See [this discussion](https://github.com/birdofpreyru/react-native-static-server/issues/8#issuecomment-1211605867)
  for details.

## Usage

Declare the `StaticServer` with a port or use the default `0` to pick a random available port.

```jsx
import StaticServer from '@dr.pogodin/react-native-static-server';

let server = new StaticServer(8080);

// Start the server
server.start().then((url) => {
  console.log("Serving at URL", url);
});

// Stop the server
server.stop();

// Check if native server running
const isRunning = await server.isRunning()
// isRunning - true/false
```

`StaticServer` serves from the document directory (default) or takes an optional absolute path to serve from.

For instance, using [react-native-fs](https://github.com/johanneslumpe/react-native-fs) you can get the document directory and specify a directory from there.

#### Default (document directory)

```javascript
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';

// create a path you want to write to
let path = RNFS.DocumentDirectoryPath + '/www';

let server = new StaticServer(8080, path);
```

#### Custom folder (iOS)

##### Create the folder for static files

Create a folder in your project's top-level directory (usually next to your node_modules and index.js file), and put the files you want to access over http in there.

##### Add folder (static files) to XCode

This folder **must be added to XCode** so it gets bundled with the app.

In XCode, `Project Navigator` right click in the folder project → `Add files to "<project>"` → Select the static folder **and clic options (Uncheck copy items if needed, Create folder references)** so don't duplicate files → Clic Add.

When the app gets bundled, this folder will be next to the compiled app, so using `MainBundlePath` property from `react-native-fs` you can access to the directory.

```javascript
import StaticServer from '@dr.pogodin/react-native-static-server';
import RNFS from 'react-native-fs';

// path where files will be served from (index.html here)
let path = RNFS.MainBundlePath + '/www';

let server = new StaticServer(8080, path);
```

If the server should only be accessible from within the app, set `localOnly` to `true`

```javascript
import StaticServer from '@dr.pogodin/react-native-static-server';

// Just set options with defaults
let server = new StaticServer({localOnly : true });
// Or also valid are:
let server = new StaticServer(8080, {localOnly : true });
let server = new StaticServer(8080, path, {localOnly : true });

```

If the server should not pause when the app is in the background, set `keepAlive` to `true`

```javascript
let server = new StaticServer({keepAlive : true });
```

Passing `0` as the port number will cause a random port to be assigned every time the server starts.
It will reset to a new random port each time the server unpauses, so this should only be used with `keepAlive`.

```javascript
let server = new StaticServer(0, {keepAlive : true });
```

<!-- links -->
[Babel]: https://babeljs.io/
