package com.drpogodin.reactnativestaticserver;

import androidx.annotation.NonNull;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.util.concurrent.Semaphore;
import java.util.Enumeration;
import java.util.function.BiConsumer;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.drpogodin.reactnativestaticserver.Errors;
import com.lighttpd.Server;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

public class ReactNativeStaticServerModule
  extends ReactNativeStaticServerSpec implements LifecycleEventListener
{
  // This semaphore is used to atomize server start-up and shut-down operations.
  // It is acquired in the very beginning of start() and stop() methods; and it
  // is normally released on the first subsequent signal from the server, at
  // the same moment the pendingPromise for those start() and stop() is resolved.
  // In edge cases, when start() or stop() is aborted due to failed runtime
  // invariant checks, this semaphore is released at those abort points, which
  // are in all cases prior to assigning the pendingPromise value.
  private static Semaphore sem = new Semaphore(1, true);

  // The currently active server instance. We assume only single server instance
  // can be active at any time, thus a simple field should be enought for now.
  // If we arrive to having possibility of multiple servers running in
  // parallel, then this will become a hash map [ID <-> Server], and we will
  // use it for communication from JS to this module to the target Server
  // instance.
  private Server server = null;

  private Promise pendingPromise = null;

  public static final String NAME = "ReactNativeStaticServer";
  public static final String LOGTAG = Errors.LOGTAG + " (Module)";

  ReactNativeStaticServerModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  public Map<String,Object> getTypedExportedConstants() {
    final Map<String,Object> constants = new HashMap<>();

    constants.put("CRASHED", Server.CRASHED);
    constants.put("IS_MAC_CATALYST", false);
    constants.put("LAUNCHED", Server.LAUNCHED);
    constants.put("TERMINATED", Server.TERMINATED);

    return constants;
  }

  @ReactMethod
  public void getLocalIpAddress(Promise promise) {
    try {
      Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();
      while(en.hasMoreElements()) {
        NetworkInterface intf = en.nextElement();
        Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses();
        while(enumIpAddr.hasMoreElements()) {
          InetAddress inetAddress = enumIpAddr.nextElement();
          if (!inetAddress.isLoopbackAddress()) {
            String ip = inetAddress.getHostAddress();
            if(InetAddressUtils.isIPv4Address(ip)) {
              promise.resolve(ip);
              return;
            }
          }
        }
      }
      promise.resolve("127.0.0.1");
    } catch (Exception e) {
      Errors.FAIL_GET_LOCAL_IP_ADDRESS.reject(promise);
    }
  }

  @ReactMethod
  public void start(
    double id, // Server ID for backward communication with JS layer.
    String configPath,
    String errlogPath,
    Promise promise
  ) {
    Log.i(LOGTAG, "Starting...");

    try {
      sem.acquire();
    } catch (Exception e) {
      Errors.INTERNAL_ERROR.log(e)
        .reject(promise, "Failed to acquire a semaphore");
      return;
    }

    if (server != null) {
      Errors.ANOTHER_INSTANCE_IS_ACTIVE.log().reject(promise);
      sem.release();
      return;
    }

    if (pendingPromise != null) {
      Errors.INTERNAL_ERROR.log().reject(promise, "Unexpected pending promise");
      sem.release();
      return;
    }

    pendingPromise = promise;

    DeviceEventManagerModule.RCTDeviceEventEmitter emitter =
      getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);

    server = new Server(
      configPath,
      errlogPath,
      new BiConsumer<String,String>() {
        public void accept(String signal, String details) {
          if (signal != Server.LAUNCHED) server = null;
          if (pendingPromise == null) {
            WritableMap event = Arguments.createMap();
            event.putDouble("serverId", id);
            event.putString("event", signal);
            event.putString("details", details);
            emitter.emit("RNStaticServer", event);
          } else {
            if (signal == Server.CRASHED) {
              Errors.SERVER_CRASHED.reject(pendingPromise, details);
            } else pendingPromise.resolve(details);
            pendingPromise = null;
            sem.release();
          }
        }
      }
    );
    server.start();
  }

  @ReactMethod
  public void getOpenPort(String address, Promise promise) {
    try {
      ServerSocket socket = new ServerSocket(
        0, 0, InetAddress.getByName(address));
      int port = socket.getLocalPort();
      socket.close();
      promise.resolve(port);
    } catch (Exception e) {
      Errors.FAIL_GET_OPEN_PORT.log(e).reject(promise);
    }
  }

  @ReactMethod
  public void stop(Promise promise) {
    Log.i(LOGTAG, "stop() triggered");

    try {
      sem.acquire();
    } catch (Exception e) {
      Errors.INTERNAL_ERROR.log(e)
        .reject(promise, "Failed to acquire a semaphore");
      return;
    }

    if (pendingPromise != null) {
      Errors.INTERNAL_ERROR
        .reject(pendingPromise, "Unexpected pending promise");
      sem.release();
      return;
    }

    pendingPromise = promise;
    server.interrupt();
  }

  @ReactMethod
  public void addListener(String eventName) {
    // NOOP
  }

  @ReactMethod
  public void removeListeners(double count) {
    // NOOP
  }

  // NOTE: Pause/resume operations, if opted, are managed in JS layer.
  @Override
  public void onHostResume() {}

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {
    stop(null);
  }
}
