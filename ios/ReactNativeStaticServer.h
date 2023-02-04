
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeStaticServerSpec.h"

@interface ReactNativeStaticServer : NSObject <NativeReactNativeStaticServerSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface ReactNativeStaticServer : RCTEventEmitter <RCTBridgeModule>
#endif

@end
