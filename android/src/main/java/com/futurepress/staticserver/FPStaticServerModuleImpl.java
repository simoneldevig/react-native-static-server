
package com.futurepress.staticserver;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.util.Enumeration;
import java.util.function.Consumer;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.lighttpd.Server;

import java.util.HashMap;
import java.util.Map;

public class FPStaticServerModuleImpl {
  // The currently active server instance. We assume only single server instance
  // can be active at any time, thus a simple field should be enought for now.
  // If we arrive to having possibility of multiple servers running in
  // parallel, then this will become a hash map [ID <-> Server], and we will
  // use it for communication from JS to this module to the target Server
  // instance.
  private Server server = null;

  public static final String NAME = "StaticServer";

  public static Map<String,Object> getConstants() {
    final Map<String,Object> constants = new HashMap<>();

    constants.put("CRASHED", Server.Signals.CRASHED);
    constants.put("LAUNCHED", Server.Signals.LAUNCHED);
    constants.put("TERMINATED", Server.Signals.TERMINATED);

    return constants;
  }

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
      promise.reject(e);
    }
  }

  public void start(
    int id, // Server ID for backward communication with JS layer.
    String configPath,
    DeviceEventManagerModule.RCTDeviceEventEmitter emitter,
    Promise promise
  ) {
    Log.i(NAME, "Starting...");

    if (server != null) {
      Exception e = new Exception("Another server instance is active");
      Log.e(NAME, e.getMessage());
      promise.reject(e);
      return;
    }

    server = new Server(
      configPath,
      new Consumer<Server.Signals>() {
        private boolean settled = false;
        public void accept(Server.Signals signal) {
          if (!settled) {
            settled = true;
            if (signal == Server.Signals.LAUNCHED) promise.resolve(null);
            else promise.reject(new Exception("Launch failure"));
          }
          WritableMap event = Arguments.createMap();
          event.putInt("serverId", id);
          event.putString("event", signal.value);
          emitter.emit("RNStaticServer", event);
        }
      }
    );
    server.start();
  }

  public void getOpenPort(Promise promise) {
    try {
      ServerSocket socket = new ServerSocket(0);
      int port = socket.getLocalPort();
      socket.close();
      promise.resolve(port);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  public void stop(Promise promise) {
    try {
      if (server != null) {
        Log.i(NAME, "Stopping...");
        server.interrupt();
        server.join();
        server = null;
        Log.i(NAME, "Stopped");
      }
      if (promise != null) promise.resolve(null);
    } catch (Exception e) {
      Log.e(NAME, "Failed to stop", e);
      if (promise != null) promise.reject(e);
    }
  }

  public void isRunning(Promise promise) {
    promise.resolve(server != null && server.isAlive());
  }
}
