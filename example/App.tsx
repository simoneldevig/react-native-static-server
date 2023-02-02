import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Button,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';

import Server, {
  STATES,
  extractBundledAssets,
} from '@dr.pogodin/react-native-static-server';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  };

  // Once the server is ready, the origin will be set and opened by WebView.
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    let fileDir: string = Platform.select({
      android: RNFS.DocumentDirectoryPath,
      ios: RNFS.MainBundlePath,
      default: '',
    });
    fileDir += '/webroot';

    // In our example, `server` is reset to null when the component is unmount,
    // thus signalling that server init sequence below should be aborted, if it
    // is still underway.
    let server: null | Server = new Server({ fileDir, stopInBackground: true });

    (async () => {
      // On Android we should extract web server assets from the application
      // package, and in many cases it is enough to do it only on the first app
      // installation and subsequent updates. In our example we'll compare
      // the content of "version" asset file with its extracted version,
      // if it exist, to deside whether we need to re-extract these assets.
      if (Platform.OS === 'android') {
        let extract = true;
        try {
          const versionD = await RNFS.readFile(`${fileDir}/version`, 'utf8');
          const versionA = await RNFS.readFileAssets('webroot/version', 'utf8');
          if (versionA === versionD) {
            extract = false;
          } else {
            await RNFS.unlink(fileDir);
          }
        } catch {
          // A legit error happens here if assets have not been extracted
          // before, no need to react on such error, just extract assets.
        }
        if (extract) {
          console.log('Extracting web server assets...');
          await extractBundledAssets(fileDir, 'webroot');
        }
      }

      server?.addStateListener((newState) => {
        // Depending on your use case, you may want to use such callback
        // to implement a logic which prevents other pieces of your app from
        // sending any requests to the server when it is inactive.

        // Here `newState` equals to a numeric state constant,
        // and `STATES[newState]` equals to its human-readable name,
        // because `STATES` contains both forward and backward mapping
        // between state names and corresponding numeric values.
        console.log(`New server state is "${STATES[newState]}"`);
      });
      const res = await server?.start();
      if (res && server) {
        setOrigin(res);
      }
    })();
    return () => {
      (async () => {
        // In our example, here is no need to wait until the shutdown completes.
        server?.stop();

        server = null;
        setOrigin('');
      })();
    };
  }, []);

  const webView = useRef<WebView>(null);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Text style={styles.title}>React Native Static Server Example</Text>
      <Text>
        The &lt;WebView&gt; component below this text displays a sample, styled
        web page, served by HTTP server powered by the React Native Static
        Server library.
      </Text>
      <Button
        onPress={() => {
          if (webView.current) {
            // This way a text message can be sent to the WebView content,
            // assuming that content document has prepared to receive it by
            // attaching .onNativeMessage() handler to its `window` object.
            const message = 'Hello from the React Native layer!';
            const envelope = `window.onNativeMessage('${message}')`;
            webView.current.injectJavaScript(envelope);
          }
        }}
        title="Send a message to the WebView content"
      />
      <View style={styles.webview}>
        <WebView
          // This way we can receive messages sent by the WebView content.
          onMessage={(event) => {
            const message = event.nativeEvent.data;
            Alert.alert('Got a message from the WebView content', message);
          }}
          // This way selected links displayed inside this WebView can be opened
          // in a separate system browser, instead of the WebView itself.
          onShouldStartLoadWithRequest={(request) => {
            const load = request.url.startsWith(origin);
            if (!load) {
              Linking.openURL(request.url);
            }
            return load;
          }}
          ref={webView}
          source={{ uri: origin }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  webview: {
    borderColor: 'black',
    borderWidth: 1,
    flex: 1,
    marginTop: 12,
  },
});
