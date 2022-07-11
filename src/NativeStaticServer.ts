import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  isRunning(): Promise<boolean>;

  start(
    port: string,
    root: string,
    localOnly: boolean,
    keepAlive: boolean,
  ): Promise<string>;

  stop(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('StaticServer');
