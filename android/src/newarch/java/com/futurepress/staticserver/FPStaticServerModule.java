package com.futurepress.staticserver;

import com.facebook.react.bridge.ReactApplicationContext;

abstract class StaticServerSpec extends NativeStaticServerSpec {
  StaticServerSpec(ReactApplicationContext context) {
    super(context);
  }
}
