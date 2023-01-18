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

  getLocalIpAddress(): Promise<string>;
  getOpenPort(): Promise<number>;

  stop(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('StaticServer');
