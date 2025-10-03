import type { TurboModule } from "react-native";
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
    getLocalIpAddress(): Promise<string>;
    getOpenPort(address: string): Promise<number>;
    stop(): Promise<string>;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeReactNativeStaticServer.d.ts.map