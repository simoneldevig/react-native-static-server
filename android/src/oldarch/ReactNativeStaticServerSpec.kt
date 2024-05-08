package com.drpogodin.reactnativestaticserver

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

abstract class ReactNativeStaticServerSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {
  abstract override fun getName(): String
  abstract fun getTypedExportedConstants(): Map<String, Any>

  abstract fun getActiveServerId(promise: Promise)

  override fun getConstants(): Map<String, Any>? {
      return getTypedExportedConstants()
  }

  abstract fun start(
    id: Double,
    configPath: String,
    errlogPath: String,
    promise: Promise)

  abstract fun getLocalIpAddress(promise: Promise)
  abstract fun getOpenPort(address: String, promise: Promise)
  abstract fun stop(promise: Promise?)

  abstract fun addListener(eventName: String?)

  abstract fun removeListeners(count: Double)
}
