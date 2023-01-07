// Imports internal constants defined within the native layer,
// and exports user-facing constants for server states.

import {NativeModules} from 'react-native';

declare global {
  var __turboModuleProxy: object | undefined;
}

// This selects between TurboModule and legacy RN library implementation.
const StaticServer = global.__turboModuleProxy
  ? require('./NativeStaticServer').default
  : NativeModules.StaticServer;

const {CRASHED, LAUNCHED, TERMINATED} = StaticServer.getConstants();

export const SIGNALS = {
  CRASHED,
  LAUNCHED,
  TERMINATED,
};

export enum STATES {
  PAUSE_FAILURE,
  START_FAILURE,
  STOP_FAILURE,
  STARTING,
  STARTED,
  PAUSING,
  PAUSED,
  STOPPING,
  STOPPED,
}
