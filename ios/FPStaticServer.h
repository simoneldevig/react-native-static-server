#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
  #import <NativeStaticServerSpec/NativeStaticServerSpec.h>
  @interface NativeStaticServer() <NativeStaticServerSpec> {
  }
  @end
#else
  @interface RNStaticServer : RCTEventEmitter <RCTBridgeModule> {
  }
  @end
#endif
