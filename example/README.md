# React Native Static Server Example

This example React Native application showcases the basic use of
[@dr.pogodin/react-native-static-server] to serve a simple static website which
is rendered inside the app using [react-native-webview] component. It also
demonstrates a few optional features relevant to such example, like messaging
between the native app and a web app inside [react-native-webview], and opening
selected web app links separately in the system browser app.

**BEWARE:** _To facilitate library development needs, this example is set up
differently from a real project &mdash; instead of consuming library code from
a node module installed from NPM, this example consumes the library from its
parent folder. Because of this, be sure to execute in the parent folder:_
```shell
# This might be not strictly needed, but good to be consistent with
# the usual environment of the example during library development.
npm install

# This clones and checks out the source code for PCRE2 and Lighttpd,
# which would be already packed into the library package from NPM.
git submodule update --init --recursive
```

With parent folder dependencies taken care of, follow the usual RN drill
to prepare and run the example:
- `npm install`
- `npm start`
- On **Android**:
  - `npm run android`
- On **iOS**:
  - ```sh
    cd ios && RCT_NEW_ARCH_ENABLED=1 pod install
    ```
    Here `RCT_NEW_ARCH_ENABLED=1` is optional, omit it to build for the old RN
    architecture.

  - Then open, build, and run the project in XCode.

[@dr.pogodin/react-native-static-server]: https://www.npmjs.com/package/@dr.pogodin/react-native-static-server
[react-native-webview]: https://www.npmjs.com/package/react-native-webview

