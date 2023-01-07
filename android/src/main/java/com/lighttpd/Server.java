package com.lighttpd;

import java.io.File;
import java.lang.Runnable;
import java.lang.System;
import java.lang.Thread;
import java.util.function.Consumer;

import android.util.Log;

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

  private static Server activeServer;
  private static final String LOGTAG = "StaticServer";
  public static enum Signals {
    CRASHED("CRASHED"),
    LAUNCHED("LAUNCHED"),
    TERMINATED("TERMINATED");

    public final String value;

    Signals(String value) {
      this.value = value;
    }
  }

  String configPath;
  private Consumer<Signals> signalConsumer;

  static public void onLaunchedCallback() {
    activeServer.signalConsumer.accept(Signals.LAUNCHED);
  }

  public Server(String configPath, Consumer<Signals> signalConsumer) {
    this.configPath = configPath;
    this.signalConsumer = signalConsumer;
  }

  @Override
  public void interrupt() {
    Log.i(LOGTAG, "Server.interrupt() triggered");
    shutdown();
    // No need to call super.interrupt() here, the native this.shutdown()
    // method will set within the native layer necessary flags that will
    // cause graceful termination of the thread.
  }

  private native void shutdown();
  public native int launch(String configPath);

  @Override
  public void run() {
    Log.i(LOGTAG, "Server.run() triggered");

    if (Server.activeServer != null) {
      Log.e(LOGTAG, "Another Server instance is active");
      signalConsumer.accept(Signals.CRASHED);
      return;
    }

    try {
      activeServer = this;
      launch(this.configPath);
      Log.i(LOGTAG, "Server terminated gracefully");
      signalConsumer.accept(Signals.TERMINATED);
    } catch (Exception error) {
      Log.e(LOGTAG, "Server crashed", error);
      signalConsumer.accept(Signals.CRASHED);
    } finally {
      activeServer = null;
    }
  }
}
