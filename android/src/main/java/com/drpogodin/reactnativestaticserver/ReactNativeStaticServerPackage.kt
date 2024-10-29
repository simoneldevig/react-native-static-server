package com.drpogodin.reactnativestaticserver

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo
import java.util.HashMap

class ReactNativeStaticServerPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == ReactNativeStaticServerModule.NAME) {
      ReactNativeStaticServerModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      val isTurboModule: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      moduleInfos[ReactNativeStaticServerModule.NAME] = ReactModuleInfo(
        ReactNativeStaticServerModule.NAME,
        ReactNativeStaticServerModule.NAME,
        canOverrideExistingModule = false,  // canOverrideExistingModule
        needsEagerInit = false,  // needsEagerInit
        hasConstants = true,  // hasConstants
        isCxxModule = false,  // isCxxModule
        isTurboModule = isTurboModule // isTurboModule
      )
      moduleInfos
    }
  }
}
