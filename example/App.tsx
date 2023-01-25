/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';

import {
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import RNFS from 'react-native-fs';
import {WebView} from 'react-native-webview';

import Server, {
  extractBundledAssets,
} from '@dr.pogodin/react-native-static-server';

const App = () => {
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
    const server = new Server({
      fileDir,
      // TODO: There is wrong typing in the current version of library,
      // which enforces that all options are required. This will be fixed later.
      nonLocal: false,
      port: 3000,
      stopInBackground: true,
    });
    (async () => {
      // TODO: Later update it to extract assets only on the first launch after
      // app installation or restart.
      await extractBundledAssets(fileDir, 'webroot');
      const res = await server.start();
      // TODO: Demo the server state listener, mention that with
      // "stopInBackground" option, it might be necessary to send signals
      // to the web app running inside WebView that it should temporarily
      // pause any requests to the local server.
      setOrigin(res);
    })();
    return () => {
      (async () => {
        // TODO: This is not completely correct, as the server initialzation
        // above is not atomic (there are several async operations), thus we
        // might end up calling this .stop() prior to server .start() above.
        // Some additional synchronization is needed here, will add it later.
        await server.stop();
      })();
    };
  }, []);

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
      <View style={styles.webview}>
        <WebView
          // This demonstrates how we can open selected links, displayed inside
          // this WebView, inside the system browser, rather than inside this
          // WebView itself.
          onShouldStartLoadWithRequest={request => {
            const load = request.url.startsWith(origin);
            if (!load) {
              Linking.openURL(request.url);
            }
            return load;
          }}
          source={{uri: origin}}
          // TODO: Demo the communication back and forth between RN layer of
          // the app, and the code running inside the webview?
        />
      </View>
    </SafeAreaView>
  );
};

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

export default App;
