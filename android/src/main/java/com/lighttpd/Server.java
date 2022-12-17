package com.lighttpd;

import java.io.File;
import java.lang.System;

// TODO: Rework the class to run it in a separate thread
public class Server {
  static {
    System.loadLibrary("lighttpd");
  }

  public static native int launch(String configPath, String modulesPath);
}
