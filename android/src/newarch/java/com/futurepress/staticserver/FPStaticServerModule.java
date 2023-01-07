
package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;

public class FPStaticServerModule extends NativeStaticServerSpec implements LifecycleEventListener {
  private FPStaticServerModuleImpl impl = new FPStaticServerModuleImpl();

  public FPStaticServerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return impl.NAME;
  }

  @Override
  public Map<String,Object> getTypedExportedConstants() {
    return FPStaticServerModuleImpl.getConstants();
  }

  @Override
  public void start(int id, String configPath, Promise promise) {
    DeviceEventManagerModule.RCTDeviceEventEmitter emitter =
      getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    impl.start(id, configPath, emitter, promise);
  }

  @Override
  public void getLocalIpAddress(Promise promise) {
    impl.getLocalIpAddress(promise);
  }

  @Override
  public void getOpenPort(Promise promise) {
    impl.getOpenPort(promise);
  }

  @Override
  public void stop(Promise promise) {
    impl.stop(promise);
  }

  @Override
  public void isRunning(Promise promise) {
    impl.isRunning(promise);
  }

  // NOTE: Pause/resume operations, if opted, are managed in JS layer.
  @Override
  public void onHostResume() {}

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {
    impl.stop(null);
  }
}
