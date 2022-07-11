
package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;
// import com.facebook.react.bridge.ReactContextBaseJavaModule;
// import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;

// import java.io.File;
// import java.io.IOException;
// import java.net.InetAddress;
// import java.net.NetworkInterface;
// import java.net.SocketException;
// import java.util.Enumeration;
// import java.net.ServerSocket;

// import android.util.Log;

// import fi.iki.elonen.SimpleWebServer;

public class FPStaticServerModule extends NativeStaticServerSpec implements LifecycleEventListener {
  private FPStaticServerModuleImpl impl;

  /*
  private final ReactApplicationContext reactContext;

  private File www_root = null;
  private int port = 9999;
  private boolean localhost_only = false;
  private boolean keep_alive = false;

  private String localPath = "";
  private SimpleWebServer server = null;
  private String	url = "";
  */

  public FPStaticServerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.impl = new FPStaticServerModuleImpl(reactContext);
  }

  @Override
  public String getName() {
    return impl.NAME;
  }

  @Override
  public void start(String _port, String root, boolean localhost, boolean keepAlive, Promise promise) {
    impl.start(_port, root, localhost, keepAlive, promise);
  }

  @Override
  public void stop(Promise promise) {
    impl.stop(promise);
  }

  public void origin(Promise promise) {
    impl.origin(promise);
  }

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
