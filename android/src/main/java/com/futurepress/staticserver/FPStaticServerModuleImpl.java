
package com.futurepress.staticserver;

import java.io.IOException;
import java.lang.SecurityException
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.ServerSocket;
import java.util.Enumeration;

import android.util.Log;

import com.lighttpd.Server;

public class FPStaticServerModuleImpl {
  private Server server = null;

  public static final String NAME = "StaticServer";

  public String getLocalIpAddress() throws SocketException {
    Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();
    while(en.hasMoreElements()) {
      NetworkInterface intf = en.nextElement();
      Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses();
      while(enumIpAddr.hasMoreElements()) {
        InetAddress inetAddress = enumIpAddr.nextElement();
        if (!inetAddress.isLoopbackAddress()) {
          String ip = inetAddress.getHostAddress();
          if(InetAddressUtils.isIPv4Address(ip)) {
            return ip;
          }
        }
      }
    }
    return "127.0.0.1";
  }

  public void start(String configPath) throws Exception {
    if (this.server != null) {
      Log.w(NAME, ".start() called while the server was running");
      this.server.stop();
    }
    this.server = new Server(configPath, () -> {
      promise.resolve("");
    });
    this.server.start();
  }

  public Integer getOpenPort() throws IOException {
    ServerSocket socket = new ServerSocket(0);
    int port = socket.getLocalPort();
    socket.close();
    return port;
  }

  public void stop() throws SecurityException {
    if (server != null) {
      server.interrupt();
      server.join();
      server = null;
    }
  }

  public void isRunning() {
    return server != null && server.isAlive();
  }
}
