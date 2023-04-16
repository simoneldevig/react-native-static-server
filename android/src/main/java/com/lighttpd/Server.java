package com.lighttpd;

import java.io.File;
import java.lang.Runnable;
import java.lang.System;
import java.lang.Thread;
import java.util.function.BiConsumer;

import android.util.Log;
import com.drpogodin.reactnativestaticserver.Errors;

/**
 * Java interface for native Lighttpd server running in a dedicated Thread.
 * Use Thread methods to operate the server:
 * .start() - To launch it;
 * .isActive() - To check its current status;
 * .interrupt() - To gracefully terminate it.
 * Also, `signalConsumer` callback provided to Server instance upon construction
 * will provide you with server state change Signals.
 *
 * As Java Thread instances may be executed only once, to restart the server
 * you should create and launch a new instance of Server object.
 *
 * BEWARE: With the current Lighttpd implementation,
 * and the way it is integrated into this library, it is not safe to run
 * multiple server instances in parallel! Be sure the previous server instance,
 * if any, has terminated or crashed before launching a new one!
 */
public class Server extends Thread {
  static {
    System.loadLibrary("lighttpd");
  }

  // NOTE: Tried to use enum, but was not able to make it work with JNI.
  public final static String CRASHED = "CRASHED";
  public final static String LAUNCHED = "LAUNCHED";
  public final static String TERMINATED = "TERMINATED";

  private static Server activeServer;
  private static final String LOGTAG = Errors.LOGTAG;

  String configPath;
  String errlogPath;
  private BiConsumer<String,String> signalConsumer;

  static public void onLaunchedCallback() {
    activeServer.signalConsumer.accept(LAUNCHED, null);
  }

  public Server(
    String configPath,
    String errlogPath,
    BiConsumer<String,String> signalConsumer
  ) {
    this.configPath = configPath;
    this.errlogPath = errlogPath;
    this.signalConsumer = signalConsumer;
  }

  @Override
  public void interrupt() {
    Log.i(LOGTAG, "Server.interrupt() triggered");
    gracefulShutdown();
    // No need to call super.interrupt() here, the native this.shutdown()
    // method will set within the native layer necessary flags that will
    // cause graceful termination of the thread.
  }

  private native void gracefulShutdown();
  public native int launch(String configPath, String errlogPath);

  @Override
  public void run() {
    Log.i(LOGTAG, "Server.run() triggered");

    if (Server.activeServer != null) {
      String msg = "Another Server instance is active";
      Log.e(LOGTAG, msg);
      signalConsumer.accept(CRASHED, msg);
      return;
    }

    try {
      activeServer = this;
      int res = launch(this.configPath, this.errlogPath);
      if (res != 0) {
        throw new Exception("Native server exited with status " + res);
      }
      Log.i(LOGTAG, "Server terminated gracefully");
      signalConsumer.accept(TERMINATED, null);
    } catch (Exception error) {
      Log.e(LOGTAG, "Server crashed", error);
      signalConsumer.accept(CRASHED, error.getMessage());
    } finally {
      activeServer = null;
    }
  }
}
