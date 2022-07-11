
package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = FPStaticServerModuleImpl.NAME)
public class FPStaticServerModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private FPStaticServerModuleImpl impl;

  public FPStaticServerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.impl = new FPStaticServerModuleImpl(reactContext);
  }

  @Override
  public String getName() {
    return impl.NAME;
  }

  @ReactMethod
  public void start(String _port, String root, Boolean localhost, Boolean keepAlive, Promise promise) {
    impl.start(_port, root, localhost, keepAlive, promise);
  }

  @ReactMethod
  public void stop(Promise promise) {
    impl.stop(promise);
  }

  @ReactMethod
  public void origin(Promise promise) {
    impl.origin(promise);
  }

  @ReactMethod
  public void isRunning(Promise promise) {
    impl.isRunning(promise);
  }

  /* Shut down the server if app is destroyed or paused */
  @Override
  public void onHostResume() {
    //start(null, null, null, null);
  }

  @Override
  public void onHostPause() {
    //stop();
  }

  @Override
  public void onHostDestroy() {
    impl.stop();
  }
}
