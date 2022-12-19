import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  isRunning(): Promise<boolean>;

  start(configPath: string): Promise<string>;

  getLocalIpAddress(): Promise<string>;
  getOpenPort(): Promise<number>;

  stop(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('StaticServer');
