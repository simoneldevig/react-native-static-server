-keep public class com.lighttpd.Server {
  void onLaunchedCallback();
}

-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}