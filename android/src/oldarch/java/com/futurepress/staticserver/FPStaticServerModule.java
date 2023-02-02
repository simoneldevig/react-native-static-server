package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;

import java.util.Map;

abstract class StaticServerSpec extends ReactContextBaseJavaModule {
  StaticServerSpec(ReactApplicationContext context) {
    super(context);
  }

  public abstract String getName();
  public abstract Map<String,Object> getTypedExportedConstants();

  public Map<String,Object> getConstants() {
    return this.getTypedExportedConstants();
  }

  public abstract void start(double id, String configPath, Promise promise);
  public abstract void getLocalIpAddress(Promise promise);
  public abstract void getOpenPort(Promise promise);
  public abstract void stop(Promise promise);
  public abstract void isRunning(Promise promise);
}
