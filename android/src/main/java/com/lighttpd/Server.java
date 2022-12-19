package com.lighttpd;

import java.io.File;
import java.lang.Runnable;
import java.lang.System;
import java.lang.Thread;

import android.util.Log;

// To operate a Server instance use following methods inherited from Thread:
// .start() - To launch the server.
// .isActive() - To get server status.
// .interrupt() - To terminate the server.
// Note: like Thread, Server instance can be used only once, and a new instance
// should be created to re-run a server.

public class Server extends Thread {
  static {
    System.loadLibrary("lighttpd");
  }

  // With the current Lighttpd implementation, it is not safe to run multiple
  // server instances simultaneously when using the shared library build. Thus,
  // this field holds the reference to the currently active server's thread,
  // if any, allowing for necessary checks and coordination
  private static Server activeServer;

  private static final String LOGTAG = "StaticServer";

  static public void onLaunchedCallback() {
    Server.activeServer.onLaunched.run();
  }

  String configPath;
  Runnable onLaunched;

  public Server(String configPath, Runnable onLaunched) {
    this.configPath = configPath;
    this.onLaunched = onLaunched;
  }

  public native int launch(String configPath);

  @Override
  public void run() {
    // Before launching this instance of server we must ensure any previously
    // active server instance is terminated, and we force it if needed.
    try {
      while (Server.activeServer != null) {
        Log.w(LOGTAG,
          "A new instance is launching while an old one is active still");
        Server.activeServer.interrupt();
        Server.activeServer.join();
      }
    } catch (Exception e) {
      Log.e(LOGTAG,
        "Failed to interrupt an active instance, new instance launch aborted");
      return;
    }
    try {
      Server.activeServer = this;
      this.launch(this.configPath);
    } finally {
      Server.activeServer = null;
    }
  }
}
