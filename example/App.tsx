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
  STATES,
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

    // In our example, `server` is reset to null when the component is unmount,
    // thus signalling that server init sequence below should be aborted, if it
    // is still underway.
    let server: null | Server = new Server({fileDir, stopInBackground: true});

    (async () => {
      // TODO: Later update it to extract assets only on the first launch after
      // app installation or restart.
      await extractBundledAssets(fileDir, 'webroot');
      server?.addStateListener(newState => {
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
          // This way selected links displayed inside this WebView can be opened
          // in a separate system browser, instead of the WebView itself.
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
