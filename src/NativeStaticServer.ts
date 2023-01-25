import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  readonly getConstants: () => {
    CRASHED: string;
    LAUNCHED: string;
    TERMINATED: string;
  };

  isRunning(): Promise<boolean>;

  addListener(eventName: string): void;

  removeListeners(count: number): void;

  start(id: number, configPath: string): Promise<string>;

  // TODO: Instead of implementing these methods in native code ourselves,
  // we probably can use `@react-native-community/netinfo` library to retrieve
  // local IP address and a random open port (thus a bit less native code
  // to maintain ourselves in this library).
  getLocalIpAddress(): Promise<string>;
  getOpenPort(): Promise<number>;

  stop(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('StaticServer');
