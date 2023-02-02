// This will handle incoming messages from the React Native layer,
// the actual .onNativeMessage name can be any name we decide to use
// in our message envelope on the native side.
window.onNativeMessage = function (message) {
  // eslint-disable-next-line no-alert
  alert(`Got message from React Native layer: ${message}`);
};

document.getElementById('message-to-rn').addEventListener('click', function () {
  // .ReactNativeWebView is automatically attached to the `window` by the host
  // WebView component, and it has .postMessage() method allowing to send text
  // messages to the React Native layer.
  if (window.ReactNativeWebView) {
    const message = 'Hello from the WebView content!';
    window.ReactNativeWebView.postMessage(message);
  }
});
