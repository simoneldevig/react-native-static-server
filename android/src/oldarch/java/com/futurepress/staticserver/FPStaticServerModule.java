
package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;

@ReactModule(name = FPStaticServerModuleImpl.NAME)
public class FPStaticServerModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private FPStaticServerModuleImpl impl = new FPStaticServerModuleImpl();

  public FPStaticServerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return impl.NAME;
  }

  @Override
  public Map<String,Object> getConstants() {
    return FPStaticServerModuleImpl.getConstants();
  }

  @ReactMethod
  public void start(double id, String configPath, Promise promise) {
    DeviceEventManagerModule.RCTDeviceEventEmitter emitter =
      getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    impl.start(id, configPath, emitter, promise);
  }

  @ReactMethod
  public void getLocalIpAddress(Promise promise) {
    impl.getLocalIpAddress(promise);
  }

  @ReactMethod
  public void getOpenPort(Promise promise) {
    impl.getOpenPort(promise);
  }

  @ReactMethod
  public void stop(Promise promise) {
    impl.stop(promise);
  }

  @ReactMethod
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
