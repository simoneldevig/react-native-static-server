package com.drpogodin.reactnativestaticserver;

import android.util.Log;
import com.facebook.react.bridge.Promise;

public enum Errors {
  ANOTHER_INSTANCE_IS_ACTIVE(
    "Failed to launch, another server instance is active."),
  FAIL_GET_LOCAL_IP_ADDRESS("Failed to get local IP adddress"),
  FAIL_GET_OPEN_PORT("Failed to get an open port"),
  LAUNCH_FAILURE("Native server failed to launch"),
  STOP_FAILURE("Failed to gracefully shutdown the server");

  private String message;
  public static final String LOGTAG = "RN_STATIC_SERVER";

  Errors(String message) {
    this.message = message;
  }

  public Error getError() {
    return new Error(this.getMessage());
  }

  public Exception getException() {
    return new Exception(this.getMessage());
  }

  public String getMessage() {
    return this.message;
  }

  public Errors log() {
    Log.e(Errors.LOGTAG, this.getMessage());
    return this;
  }

  public Errors log(Exception e) {
    Log.e(Errors.LOGTAG, e.toString());
    return this.log();
  }

  public void reject(Promise promise) {
    if (promise != null) {
      promise.reject(this.toString(), this.getMessage(), this.getError());
    }
  }

  public String toString() {
    return Errors.LOGTAG + ":" + this.name();
  }
}

