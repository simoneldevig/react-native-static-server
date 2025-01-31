import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly getConstants: () => {
    CRASHED: string;
    IS_MAC_CATALYST: boolean;
    LAUNCHED: string;
    TERMINATED: string;
  };

  addListener(eventName: string): void;

  getActiveServerId(): Promise<number | null>;

  removeListeners(count: number): void;

  start(id: number, configPath: string, errlogPath: string): Promise<string>;

  // TODO: Instead of implementing these methods in native code ourselves,
  // we probably can use `@react-native-community/netinfo` library to retrieve
  // local IP address and a random open port (thus a bit less native code
  // to maintain ourselves in this library).
  getLocalIpAddress(): Promise<string>;

  getOpenPort(address: string): Promise<number>;
  stop(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeStaticServer');
