import { NativeModules, Platform } from 'react-native';

import type { Spec } from './NativeReactNativeStaticServer';

const LINKING_ERROR =
  `The package '@dr.pogodin/react-native-static-server' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const ReactNativeStaticServerModule = isTurboModuleEnabled
  ? require('./NativeReactNativeStaticServer').default
  : NativeModules.ReactNativeStaticServer;

const ReactNativeStaticServer = ReactNativeStaticServerModule
  ? ReactNativeStaticServerModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

export default ReactNativeStaticServer as Spec;
