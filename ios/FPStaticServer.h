
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNStaticServerSpec.h"

@interface NativeStaticServer : NSObject <NativeStaticServerSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNStaticServer : RCTEventEmitter <RCTBridgeModule>
#endif

@end
