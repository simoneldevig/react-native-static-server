
package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.module.annotations.ReactModule;

import android.util.Log;

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

  @ReactMethod
  public void start(String configPath, Promise promise) {
    try {
      impl.start(configPath);
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public Integer getOpenPort(Promise promise) {
    try {
      promise.resolve(impl.getOpenPort());
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void stop(Promise promise) {
    try {
      impl.stop();
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void isRunning(Promise promise) {
    promise.resolve(impl.isRunning());
  }

  // Note: these operations are now managed from JS layer, thus no need for
  // them here, and probably entire lifecycle listening here may be removed.
  @Override
  public void onHostResume() {}

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {
    try {
      impl.stop();
    } catch (Exception e) {
      Log.e(impl.NAME, "Failed to stop server in onHostDestroy()", e);
    }
  }
}
