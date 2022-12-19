
package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;

import android.util.Log;

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
  public void start(String configPath, Promise promise) {
    try {
      impl.start(configPath);
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @Override
  public Integer getOpenPort(Promise promise) {
    try {
      promise.resolve(impl.getOpenPort());
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @Override
  public void stop(Promise promise) {
    try {
      impl.stop();
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @Override
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
