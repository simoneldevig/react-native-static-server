# React Native Static Server Example

This example React Native application showcases the basic use of
[@dr.pogodin/react-native-static-server] to serve a simple static website which
is rendered inside the app using [react-native-webview] component. It also
demonstrates a few optional features relevant to such example, like messaging
between the native app and a web app inside [react-native-webview], and opening
selected web app links separately in the system browser app.

To run it follow the usual RN drill:
- `npm install`
- `npm start`
- On **Android**:
  - `npm run android`
- On **iOS**:
  - `cd ios && pod install`
  - Then open, build, and run the project in XCode.

[@dr.pogodin/react-native-static-server]: https://www.npmjs.com/package/@dr.pogodin/react-native-static-server
[react-native-webview]: https://www.npmjs.com/package/react-native-webview

