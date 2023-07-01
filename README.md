# React Native Static Server

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-native-static-server.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-native-static-server.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/birdofpreyru/react-native-static-server/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/birdofpreyru/react-native-static-server)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/react-native-static-server?style=social)](https://github.com/birdofpreyru/react-native-static-server)
[![Dr. Pogodin Studio](https://raw.githubusercontent.com/birdofpreyru/react-native-static-server/master/.README/logo-dr-pogodin-studio.svg)](https://dr.pogodin.studio/docs/react-native-static-server)

Embed HTTP server for [React Native] applications for Android, iOS, Mac (Catalyst),
and Windows platforms. Powered by [Lighttpd] server, supports both [new][New Architecture]
and [old][Old Architecture] RN architectures.

[![Sponsor](https://raw.githubusercontent.com/birdofpreyru/react-native-static-server/master/.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

### Sponsored By:
<table>
  <tr>
    <td width="141px">
      <img
        alt="Luna4 Enterprises Inc."
        width="100%"
        height="auto"
        src="https://raw.githubusercontent.com/birdofpreyru/react-native-static-server/master/.README/logo-luna4.png"
      >
    </td>
    <td>
      <strong>Luna4 Enterprises Inc.</strong> &mdash; The support for Windows
      and Mac Catalyst systems would not happen any time soon without their
      interest and financial contribution.
    </td>
  </tr>
</table>

<!-- links -->
[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[example app]: https://github.com/birdofpreyru/react-native-static-server/tree/master/example
[Expo]: https://expo.dev
[OLD-README.md]: https://github.com/birdofpreyru/react-native-static-server/blob/master/OLD-README.md
[react-native-device-info]: https://www.npmjs.com/package/react-native-device-info
[react-native-fs]: https://www.npmjs.com/package/react-native-fs
[React Native]: https://reactnative.dev

## Content

- [Getting Started](#getting-started)
  - [Bundling-in Server Assets Into an App Statically](#bundling-in-server-assets-into-an-app-statically)
- [Reference](#reference)
- [Project History and Roadmap](#project-history-and-roadmap)
  - [Notable Versions of the Library]
  - [Roadmap]
- [Documentation for Older Library Versions (v0.6, v0.5)][OLD-README.md]
- [Migration from Older Versions (v0.6, v0.5) to v0.7](#migration-from-older-versions-v06-v05-to-v07)

## Getting Started
[Getting Started]: #getting-started

[CMake]: https://cmake.org
[Homebrew]: https://brew.sh

**Note:** _In addition to these instructions, have a look at
[the example project][example app] included into the library repository._

- [CMake] is required on the build host.
  - On **MacOS**, the `pkg-config` dependency is also needed. You can install both via [Homebrew],
    by executing:
    ```shell
    $ brew install cmake pkg-config
    ```
    **IMPORTANT:** [Homebrew] should have added `eval "$(/opt/homebrew/bin/brew shellenv)"'`
    command to your `.zshrc` or `.bashrc`. Although this works for interactive terminals,
    it might not work for sessions inside of other apps, such as XCode, therefore you might need to
    manually create symbolic links:

    ```shell
    $ sudo ln -s $(which cmake) /usr/local/bin/cmake
    $ sudo ln -s $(which pkg-config) /usr/local/bin/pkg-config
    ```

    For details read: https://earthly.dev/blog/homebrew-on-m1,
    and [Issue#29](https://github.com/birdofpreyru/react-native-static-server/issues/29).

  - On **Ubuntu** you may get it by executing
    ```shell
    $ sudo apt-get update && sudo apt-get install cmake
    ```

- Install the package:
  ```shell
  $ npm install --save @dr.pogodin/react-native-static-server
  ```
  **Note:** _In case you prefer to install this library from its source code
  (i.e. directly from its GitHub repo, or a local folder), mind that it depends
  on several Git sub-modules, which should be clonned and checked out by this
  command in the library's codebase root:
  `$ git submodule update --init --recursive`. Released NPM packages of
  the library have correct versions of the code from these sub-modules bundled
  into the package, thus no need to clone and check them out after installation
  from NPM._

- For **Android**:
  - In the `build.gradle` file set `minSdkVersion` equal `28`
    ([SDK 28 &mdash; Android 9](https://developer.android.com/studio/releases/platforms#9.0),
    released in August 2018), or larger.

    **Note:** _Support of older SDKs is technically possible, but it is not
    a priority now._

- For **iOS**:
  - After installing the package, enter `ios` folder of the app's codebase
    and execute
    ```shell
    $ pod install
    ```

- For [Expo]: \
  _It probably works with some additional setup (see
  [Issue#8](https://github.com/birdofpreyru/react-native-static-server/issues/8)),
  however at the moment we don't support it officially. If anybody wants
  to help with this, contributions to the documentation / codebase are welcome._

- For **Mac Catalyst**:
  - Disable Flipper in your app's Podfile.
  - Add _Incoming Connections (Server)_ entitlement to the _App Sandbox_
    (`com.apple.security.network.server` entitlement).
  - If you bundle inside your app the assets to serve by the server,
    keep in mind that in Mac Catalyst build they'll end up in a different
    path, compared to the regular iOS bundle (see [example app]): \
    iOS: `${RNFS.MainBundlePath}/webroot`; \
    Mac Catalyst: `${RNFS.MainBundlePath}/Content/Resources/webroot`.

    Also keep in mind that `Platform.OS` value equals `iOS` both for the normal
    iOS and for the Mac Catalyst builds, and you should use different methods
    to distinguish them; for example relying on `getDeviceType()` method of
    [react-native-device-info] library, which returns 'Desktop' in case of
    Catalyst build.

- For **Windows**:
  - Out of the box, the current version of [react-native-fs] library (v2.20.0),
    we depend upon, is broken on Windows. For now, it can be worked around by
    picking up
    [RNFSManager.h](https://github.com/birdofpreyru/react-native-static-server/blob/master/example/windows/ReactNativeStaticServerExample/RNFSManager.h) and
    [RNFSManager.cpp](https://github.com/birdofpreyru/react-native-static-server/blob/master/example/windows/ReactNativeStaticServerExample/RNFSManager.cpp) files
    from the example app, and including them into the host app codebase,
    the same way as the example app does.

  - Add _Internet (Client & Server)_, _Internet (Client)_,
    and _Private Networks (Client & Server)_ capabilities to your app.

    NOTE: _It seems, the core server functionality is able to work without these
    capabilities, however some functions might be affected, and the error reporting
    in the current Windows implementation probably won't make it clear that something
    failed due to the lack of declared capabilities._

- Create and run a server instance:

  ```jsx
  import { useEffect } from 'react';
  import { Text, View } from 'react-native';
  import Server from '@dr.pogodin/react-native-static-server';

  // We assume no more than one instance of this component is mounted in the App
  // at any given time; otherwise some additional logic will be needed to ensure
  // no more than a single server instance can be launched at a time.
  //
  // Also, keep in mind, the call to "server.stop()" without "await" does not
  // guarantee that the server has shut down immediately after that call, thus
  // if such component is unmounted and immediately re-mounted again, the new
  // server instance may fail to launch because of it.
  export default function ExampleComponent() {
    const [origin, setOrigin] = useState('');

    useEffect(() => {
      let server = new Server({
        // See further in the docs how to statically bundle assets into the App,
        // alernatively assets to serve might be created or downloaded during
        // the app's runtime.
        fileDir: '/path/to/static/assets/on/target/device',
      });
      (async () => {
        // You can do additional async preparations here; e.g. on Android
        // it is a good place to extract bundled assets into an accessible
        // location.

        // Note, on unmount this hook resets "server" variable to "undefined",
        // thus if "undefined" the hook has unmounted while we were doing
        // async operations above, and we don't need to launch
        // the server anymore.
        if (server) setOrigin(await server.start());
      })();

      return () => {
        setOrigin('');

        // No harm to trigger .stop() even if server has not been launched yet.
        server.stop();

        server = undefined;
      }
    }, []);

    return (
      <View>
        <Text>Hello World!</Text>
        <Text>Server is up at: {origin}</Text>
      </View>
    );
  }
  ```

### Bundling-in Server Assets Into an App Statically

The assets to be served by the server may come to the target device in different
ways, for example, they may be generated during the app's runtime, or downloaded
to the device by the app from a remote location. They also may be statically
bundled-in into the app's bundle at the build time, and it is this option
covered in this section.

Let's assume the assets to be served by the server are located in the app's
codebase inside the folder `assets/webroot` (the path relative to the codebase
root), outside `android`, `ios`, and `windows` project folders, as we presumably want
to reuse the same assets in both projects, thus it makes sense to keep them
outside platform-specific sub-folders.

- **Android**
  - Inside `android/app/build.gradle` file look for `android.sourceSets`
    section, or create one if it does no exist. To bundle-in our assets for
    server, it should look like this (note, this way we'll also bundle-in all
    other content of our `assets` folder, if there is anything beside `webroot`
    subfolder).
    ```gradle
    android {
      sourceSets {
        main {
          assets.srcDirs = [
            '../../assets'
            // This array may contain additional asset folders to bundle-in.
            // Paths in this array are relative to "build.gradle" file, and
            // should be comma-separated.
          ]
        }
      }
      // ... Other stuff.
    }
    ```
  - On Android the server cannot access bundled assets as regular files, thus
    before starting the server to serve them, these assets should be extracted
    into a folder accessible to the server (_e.g._ app's document folder).
    To facilitate it, this library provides [extractBundledAssets()] function.
    You want to use it in this manner:
    ```jsx
    // TODO: To be updated, see a better code inside the example app.

    import RNFS from 'react-native-fs';
    import {extractBundledAssets} from '@dr.pogodin/react-native-static-server';

    async function prepareAssets() {
      const targetWebrootPathOnDevice = `${RNFS.DocumentDirectoryPath}/webroot`;

      // It is use-case specific, but in general if target webroot path exists
      // on the device, probably these assets have been extracted in a previous
      // app launch, and there is no need to extract them again. However, in most
      // locations these extracted files won't be delected automatically on
      // the apps's update, thus you'll need to check it and act accordingly,
      // which is abstracted as needsOverwrite() function in the condition.
      const alreadyExtracted = await RNFS.exists(targetWebrootPathOnDevice);

      // TODO: Give an example of needsOverwrite(), relying on app version
      // stored in local files. Maybe we should provide with the library
      // an utility function which writes to disk a version fingerprint of
      // the app, thus allowing to detect app updates. For now, have
      // a look at the example project in the repo, which demonstrates more
      // realistic code.
      if (!alreadyExtracted || needsOverwrite()) {
        // TODO: Careful here, as on platforms different from Android we do not
        // need to extract assets, we also should not remove them, thus we need
        // a guard when entering this clean-up / re-extract block.
        if (alreadyExtracted) await RNFS.unlink(targetWebrootPathOnDevice);

        // This function is a noop on other platforms than Android, thus no need
        // to guard against the platform.
        await extractBundledAssets(targetWebrootPathOnDevice, 'webroot');
      }

      // "webroot" assets have been extracted into the target folder, which now
      // can be served by the server.
    }
    ```

- **iOS**
  - Open you project's workspace in XCode. In the &laquo;_Project
    Navigator_&raquo; panel right-click on the project name and select
    &laquo;_Add Files to "YOUR-PROJECT-NAME"..._&raquo; (alternatively,
    you can find this option in the XCode head menu under _Files >
    Add Files to "YOUR-PROJECT-NAME"..._). In the opened menu uncheck
    &laquo;_Copy items if needed_&raquo;, then select our `webroot` folder,
    and press &laquo;_Add_&raquo; button to add "webroot" assets
    to the project target.

- **Mac Catalyst**
  - The bundling for iOS explained above also bundles assets for Mac Catalyst;
    beware, however, the bundled assets end up in a slightly different location
    inside the bundle in this case (see details earlier in the [Getting Started]
    section).

- **Windows**
  - Edit `PropertySheet.props` file inside your app's
    `windows/YOUR_PROJECT_NAME` folder, adding the following nodes into its root
    `<Project>` element:
    ```xml
    <ItemGroup>
      <_CustomResource Include="..\..\assets\webroot\**\*">
        <Link>webroot\%(RecursiveDir)%(FileName)%(Extension)</Link>
        <DeploymentContent>true</DeploymentContent>
      </_CustomResource>
    </ItemGroup>
    <Target Name="_CollectCustomResources" BeforeTargets="AssignTargetPaths">
      <Message Text="Adding resource: %(_CustomResource.Identity) -&gt; %(_CustomResource.Link)" />
      <ItemGroup>
        <None Include="@(_CustomResource)" />
      </ItemGroup>
    </Target>
    ```

## Reference
- [Server] &mdash; Represents a server instance.
  - [constructor()] &mdash; Creates a new [Server] instance.
  - [.addStateListener()] &mdash; Adds state listener to the server instance.
  - [.removeAllStateListeners()] &mdash; Removes all state listeners from this
    server instance.
  - [.removeStateListener()] &mdash; Removes specified state listener from this
    server instance.
  - [.start()] &mdash; Launches the server.
  - [.stop()] &mdash; Stops the server.
  - [.errorLog] &mdash; Holds `errorLog` configuration.
  - [.fileDir] &mdash; Holds absolute path to static assets on target device.
  - [.hostname] &mdash; Holds the hostname used by server.
  - [.id] &mdash; Hold unique ID of the server instance.
  - [.nonLocal] &mdash; Holds `nonLocal` value provided to [constructor()].
  - [.origin] &mdash; Holds server origin.
  - [.port] &mdash; Holds the port used by server.
  - [.state] &mdash; Holds the current server state.
  - [.stopInBackground] &mdash; Holds `stopInBackground` value provided to
    [constructor()].
- [extractBundledAssets()] &mdash; Extracts bundled assets into a regular folder
  (Android-specific).
- [getActiveServer()] &mdash; Gets currently active, starting, or stopping
  server instance, if any.
- [resolveAssetsPath()] &mdash; Resolves relative paths for bundled assets.
- [ERROR_LOG_FILE] &mdash; Location of the error log file.
- [STATES] &mdash; Enumerates possible states of [Server] instance.
- [UPLOADS_DIR] &mdash; Location for uploads.
- [WORK_DIR] &mdash; Location of the working files.
- [ErrorLogOptions] &mdash; Options for error logging.

### Server
[Server]: #server
```js
import Server from '@dr.pogodin/react-native-static-server';
```
The [Server] class represents individual server instances.

**BEWARE:** At most one server instance can be active
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
  neither `file:///`) are automatically prepended by the platform-dependent
  base path (document or main bundle directory); however, empty `fileDir` value
  is forbidden &mdash; if you really want to serve all content from the base
  directory, provide it its absolute path explicitly.

- `errorLog` &mdash; **boolean** | [ErrorLogOptions] &mdash; Optional.
  If set **true** (treated equivalent to `{}`) the server instance will
  output basic server state and error logs from the Lighttpd native core
  into the [ERROR_LOG_FILE]. Passing in an [ErrorLogOptions] object with
  additional flags allows to add additional debug output from Lighttpd core
  into the log file. Default value is **false**, in which case the server
  instance only outputs basic server state and error logs into the OS
  system log; note that enabling the file logging with this option disables
  the logging into the system log.

  **BEWARE:** If you opt for file logging with this option, it is up to you
  to control and purge the [ERROR_LOG_FILE] as needed.

- `hostname` &mdash; **string** &mdash; Optional. Sets the address for server
  to bind to.
  - By default, when `nonLocal` option is **false**, `hostname` is set equal
    "`127.0.0.1`" &mdash; the server binds to the loopback address,
    and it is accessible only from within the host app.
  - If `nonLocal` option is **true**, and `hostname` was not given, it is
    initialized with empty string, and later assigned to a library-selected
    non-local IP address, at the first launch of the server.
  - If `hostname` value is provided, the server will bind to the given address,
    and it will ignore `nonLocal` option.

  _NOTE: In future we'll deprecate `nonLocal` option, and instead will use
  special `hostname` values to ask the library to automatically select
  appropriate non-local address._

- `nonLocal` &mdash; **boolean** &mdash; Optional. By default, if `hostname`
  option was not provided, the server starts at the "`127.0.0.1`" (loopback)
  address, and it is only accessible within the host app.
  With this flag set **true** the server will be started on an IP address
  also accessible from outside the app.

  _NOTE: When `hostname` option is provided,
  the `nonLocal` option is ignored. The plan is to deprecate `nonLocal` option
  in future, in favour of special `hostname` values supporting the current
  `nonLocal` functionality._

- `port` &mdash; **number** &mdash; Optional. The port at which to start the server.
  If 0 (default) an available port will be automatically selected.

- `stopInBackground` &mdash; **boolean** &mdash; Optional.

  By default, the server continues to work as usual when its host app enters
  the background / returns to the foreground (better say, by default, it does
  not attempt anything special in these situations, but the host OS may kill or
  restrict it in the background forcefully, depending on OS and app configs).

  With this flag set **true**, an active server will stop automatically each
  time the app enters the background, and then automatically launch again each
  time the app re-enters the foreground. Note that calling [.stop()] explicitly
  will stop the server for good&nbsp;&mdash; no matter `stopInBackground` value,
  once [.stop()] is called the server won't restart automatically unless you
  explicitly [.start()] it again.

  To faciliate debugging, when a server starts / stops automatically because of
  the `stopInBackground` option and app transitions between the foreground and
  the background; the corresponding `STARTING` and `STOPPING` messages emitted
  to the server state listeners (see [.addStateListener()]) will have their
  `details` values set equal "_App entered background_",
   and "_App entered foreground_" strings.

#### .addStateListener()
[.addStateListener()]: #addstatelistener
```ts
server.addStateListener(listener: StateListener): Unsubscribe;

// where StateListener and Unsubscribe signatures are:
type StateListener = (state: string, details: string, error?: Error) => void;
type UnsubscribeFunction = () => void;
```
Adds given state listener to the server instance. The listener will be called
each time the server state changes, with the following arguments:
- `state` &mdash; **string** &mdash; The new state, one of [STATES] values.
- `details` &mdash; **string** &mdash; Additional details about the state change,
  if any can be provided; an empty string otherwise.
- `error` &mdash; [Error] &mdash; If server instance crashes, this will be
  the related error object; otherwise undefined.

This method returns "unsubscribe" function, call it to remove added
listener from the server instance.

#### .removeAllStateListeners()
[.removeAllStateListeners()]: #removeallstatelisteners
```ts
server.removeAllStateListeners()
```
Removes all state listeners connected to the server instance.

#### .removeStateListener()
[.removeStateListener()]: #removestatelistener
```ts
server.removeStateListener(listener: StateListener)
```
Removes given state `listener` if it is connected to the server instance;
does nothing otherwise.

#### .start()
[.start()]: #start
```ts
server.start(details?: string): Promise<string>
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

The optional `details` argument, if provided, will be added to
the `STARTING` message emitted to the server state change listeners
(see [.addStateListener()]) in the beginning of this method, if the server
launch is necessary.

**BEWARE:** With the current library version, at most one server instance can be
active within an app at any time. Calling [.start()] when another server instance
is running will result in the start failure and `CRASHED` state. See also
[getActiveServer()].

#### .stop()
[.stop()]: #stop
```ts
server.stop(details?: string): Promise<>
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

The optional `details` argument, if provided, will be added to
the `STARTING` message emitted to the server state change listeners
(see [.addStateListener()]) in the beginning of this method, if the server
launch is necessary.

#### .errorLog
[.errorLog]: #errorlog
```ts
server.errorLog: false | ErrorLogOptions;
```
Readonly property. It holds the error log configuration (see [ErrorLogOptions]),
opted for at the time of this server instance [construction][constructor()].
Note, it will be `{}` if `errorLog` option of [constructor()] was set **true**;
and it will be **false** (default) if `errorLog` option was omitted in
the [constructor()] call.

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
Readonly property. It holds the hostname used by the server. If no `hostname`
value was provided to the server's [constructor()], this property will be:
- Without `nonLocal` option it will be equal `127.0.0.1` (the loopback address)
  from the very beginning;
- Otherwise, it will be an empty string until the first launch of the server
  instance, after which it will become equal to the IP address selected by
  the server automatically, and won't change upon subsequent server re-starts.

#### .id
[.id]: #id
```ts
server.id: number;
```
Readonly. It holds unique ID number of the server instance, which is used
internally for communication between JS an native layers, and also exposed
to the library consumer, for debug.

**BEWARE:** In the current library implementation, this ID is generated simply
as `Date.now() % 65535`, which is not random, and not truly unique &mdash;
the ID collision probability across different server instances is high.
This should be fine as long as you don't create many server instances in your
app, and don't rely on the uniqueness of these IDs across different app launches.
Switching to real UUIDs is on radar, but not the highest priority for now.

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

### extractBundledAssets()
[extractBundledAssets()]: #extractbundledassets
```ts
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

### resolveAssetsPath()
[resolveAssetsPath()]: #resolveassetspath
```ts
import {resolveAssetsPath} from '@dr.pogodin/react-native-static-server';

resolveAssetsPath(path: string): string;
```
If given `path` is relative, it returns the corresponding absolute path,
resolved relative to the platform-specific base location for bundled assets;
otherwise, it just returns given absolute `path` as is. 

In other words, it exposes the same path resolution logic used by [Server]'s
[constructor()] for its `fileDir` argument.

**Arguments**
- `path` &mdash; **string** &mdash; Absolute or relative path.

Returns **string** &mdash; The corresponding absolute path.

### ERROR_LOG_FILE
[ERROR_LOG_FILE]: #error_log_file
```ts
import {ERROR_LOG_FILE} from '@dr.pogodin/react-native-static-server';
```
Constant **string**. It holds the filesystem location of the error log file
(see `errorLog` option of Server's [constructor()]). The actual value is
"[WORK_DIR]`/errorlog.txt`" &mdash; all server instances within an app output
their logs, when opted, into the same file; and it is up to the host app
to purge this file when needed.

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

It also contains the backward mapping between state numeric values and their
human-readable names used above, _i.e._
```js
console.log(STATES.ACTIVE); // Logs: 0
console.log(STATES[0]);     // Logs: ACTIVE
```

### UPLOADS_DIR
[UPLOADS_DIR]: #uploads_dir
```ts
import {UPLOADS_DIR} from '@dr.pogodin/react-native-static-server';
```
Constant **string**. It holds the filesystem location where all server instances
within an app keep any uploads to the server. The actual value is
"[WORK_DIR]`/uploads`".

### WORK_DIR
[WORK_DIR]: #work_dir
```ts
import {WORK_DIR} from '@dr.pogodin/react-native-static-server';
```
Constant **string**. It holds the filesystem location where all server instances
within an app keep their working files (configs, logs, uploads). The actual
value is "**RNFS.TemporaryDirectoryPath**`/__rn-static-server__`",
where **RNFS.TemporaryDirectoryPath** is the temporary directory path for
the app as reported by the [react-native-fs] library.

### ErrorLogOptions
[ErrorLogOptions]: #errorlogoptions
```ts
import {type ErrorLogOptions} from '@dr.pogodin/react-native-static-server';
```
The type of `errorLog` option of the Server's [constructor()]. It describes an
object with the following optional boolean flags; each of them enables
the similarly named
[Lighttpd debug option](https://redmine.lighttpd.net/projects/lighttpd/wiki/DebugVariables):
- `conditionCacheHandling` &mdash; **boolean** &mdash; Optional.
- `conditionHandling` &mdash; **boolean** &mdash; Optional.
- `fileNotFound` &mdash; **boolean** &mdash; Optional.
- `requestHandling` &mdash; **boolean** &mdash; Optional.
- `requestHeader` &mdash; **boolean** &mdash; Optional.
- `requestHeaderOnError` &mdash; **boolean** &mdash; Optional.
- `responseHeader` &mdash; **boolean** &mdash; Optional.
- `sslNoise` &mdash; **boolean** &mdash; Optional.
- `timeouts` &mdash; **boolean** &mdash; Optional.

Without any flag set the server instance will still output very basic state
and error messages into the log file.

## Project History and Roadmap

[GCDWebServer]: https://github.com/swisspol/GCDWebServer
[NanoHttpd]: https://github.com/NanoHttpd/nanohttpd
[Lighttpd]: https://www.lighttpd.net
[New Architecture]: https://reactnative.dev/docs/the-new-architecture/landing-page
[Old Architecture]: https://reactnative.dev/docs/native-modules-intro
[React Native]: https://reactnative.dev

This project started as a fork of the original
[`react-native-static-server`](https://www.npmjs.com/package/react-native-static-server)
library, abandoned by its creators.
It is published to NPM as
[@dr.pogodin/react-native-static-server](https://www.npmjs.com/package/@dr.pogodin/react-native-static-server),
and it aims to provide a well-maintained embed HTTP server for React Native (RN)
applications.

### Roadmap
[Roadmap]: #roadmap

**NOTE:** _With an appropriate financial contribution you can influence
the roadmap&nbsp;&mdash; the aims, priorities, and timelines for this
library&nbsp;&mdash; everything can be adjusted for the needs of a paying
customer._

These are future development aims, ordered by their current priority (from
the top priority, to the least priority):

- Support of custom configurartion of HTTP server, and inclusion of
  additional [Lighttpd] plugins (only three plugins for serving static
  assets are included now by default on all platforms).
- Support of [Expo].
- Better documentation (migration of the documentation
  to a [Docusaurus](https://docusaurus.io) website.

### Notable Versions of the Library
[Notable Versions of the Library]: #notable-versions-of-the-library
[Releases Page on GitHub]: https://github.com/birdofpreyru/react-native-static-server/releases

- See [Releases Page on GitHub] for details on latest library versions,
  which did not deserve a special mention here.

- **v0.7.0** &mdash; The new version of the library. Reworked API,
  powered by [Lighttpd] v1.4.69 and latest [React Native] v0.71.2
  on both Android and iOS, supports both [new][New Architecture]
  and [old][Old Architecture] RN Architectures.

- **v0.6.0-alpha.8** &mdash; The aim for **v0.6** release was
  to refactor the library to support React Native's [New Architecture],
  while keeping backward compatibility with RN's [Old Architecture],
  and the original library API. The aim was mostly achieved as of
  v0.6.0-alpha.8, but as development focus shifted into v0.7 development,
  the v0.6 was effectively abandoned.

  As of the latest alpha v0.6 version, the status was:
  - The code refactoring was completed.
  - **Android**: relied on [NanoHttpd], tested with React Native v0.70.0 for
    both RN's [old][Old Architecture] and [new][New Architecture] architectures.
  - **iOS**: relied on [GCDWebServer], tested with React Native v0.70.0 for
    RN's [Old Architecture]. \
    **NOT TESTED** with RN's [New Architecture], it likely required minor fixes
    to support it.

- **v0.5.5** &mdash; The latest version of the original library, patched
  to work with React Native v0.67&ndash;0.68, and with all dependencies
  updated (as of May 17, 2022). Relies on [NanoHttpd] on Android,
  and [GCDWebServer] on iOS; only supports RN's [Old Architecture],
  and was not tested with RN v0.69+.

## Documentation for Older Library Versions (v0.6, v0.5)
See [OLD-README.md]

## Migration from Older Versions (v0.6, v0.5) to v0.7

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
    "`127.0.0.1`" (the loopback address) and is only accessible from within the app. Setting `nonLocal`
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
  internal files (all within its [WORK_DIR]), don't mess with it if you do
  anything special with the temporary folder.

[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
