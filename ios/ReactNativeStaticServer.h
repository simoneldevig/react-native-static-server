#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeStaticServerSpec.h"

@interface ReactNativeStaticServer : RCTEventEmitter <NativeReactNativeStaticServerSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativeStaticServer : RCTEventEmitter <RCTBridgeModule>
#endif

@end
