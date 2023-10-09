
/*
 * This file is auto-generated from a NativeModule spec file in js.
 *
 * This is a C++ Spec class that should be used with MakeTurboModuleProvider to register native modules
 * in a way that also verifies at compile time that the native module matches the interface required
 * by the TurboModule JS spec.
 */
#pragma once

#include <NativeModules.h>
#include <tuple>

namespace winrt::ReactNativeStaticServer {

struct ReactNativeStaticServerSpec_Constants {
    std::string CRASHED;
    bool IS_MAC_CATALYST;
    std::string LAUNCHED;
    std::string TERMINATED;
};


inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeStaticServerSpec_Constants*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"CRASHED", &ReactNativeStaticServerSpec_Constants::CRASHED},
        {L"IS_MAC_CATALYST", &ReactNativeStaticServerSpec_Constants::IS_MAC_CATALYST},
        {L"LAUNCHED", &ReactNativeStaticServerSpec_Constants::LAUNCHED},
        {L"TERMINATED", &ReactNativeStaticServerSpec_Constants::TERMINATED},
    };
    return fieldMap;
}

struct ReactNativeStaticServerSpec : winrt::Microsoft::ReactNative::TurboModuleSpec {
  static constexpr auto constants = std::tuple{
      TypedConstant<ReactNativeStaticServerSpec_Constants>{0},
  };
  static constexpr auto methods = std::tuple{
      Method<void(std::string) noexcept>{0, L"addListener"},
      Method<void(double) noexcept>{1, L"removeListeners"},
      Method<void(double, std::string, std::string, Promise<std::string>) noexcept>{2, L"start"},
      Method<void(Promise<std::string>) noexcept>{3, L"getLocalIpAddress"},
      Method<void(std::string, Promise<double>) noexcept>{4, L"getOpenPort"},
      Method<void(Promise<std::string>) noexcept>{5, L"stop"},
  };

  template <class TModule>
  static constexpr void ValidateModule() noexcept {
    constexpr auto constantCheckResults = CheckConstants<TModule, ReactNativeStaticServerSpec>();
    constexpr auto methodCheckResults = CheckMethods<TModule, ReactNativeStaticServerSpec>();

    REACT_SHOW_CONSTANT_SPEC_ERRORS(
          0,
          "ReactNativeStaticServerSpec_Constants",
          "    REACT_GET_CONSTANTS(GetConstants) ReactNativeStaticServerSpec_Constants GetConstants() noexcept {/*implementation*/}\n"
          "    REACT_GET_CONSTANTS(GetConstants) static ReactNativeStaticServerSpec_Constants GetConstants() noexcept {/*implementation*/}\n");

    REACT_SHOW_METHOD_SPEC_ERRORS(
          0,
          "addListener",
          "    REACT_METHOD(addListener) void addListener(std::string eventName) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(addListener) static void addListener(std::string eventName) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          1,
          "removeListeners",
          "    REACT_METHOD(removeListeners) void removeListeners(double count) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(removeListeners) static void removeListeners(double count) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          2,
          "start",
          "    REACT_METHOD(start) void start(double id, std::string configPath, std::string errlogPath, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(start) static void start(double id, std::string configPath, std::string errlogPath, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          3,
          "getLocalIpAddress",
          "    REACT_METHOD(getLocalIpAddress) void getLocalIpAddress(::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(getLocalIpAddress) static void getLocalIpAddress(::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          4,
          "getOpenPort",
          "    REACT_METHOD(getOpenPort) void getOpenPort(std::string address, ::React::ReactPromise<double> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(getOpenPort) static void getOpenPort(std::string address, ::React::ReactPromise<double> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          5,
          "stop",
          "    REACT_METHOD(stop) void stop(::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(stop) static void stop(::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
  }
};

} // namespace winrt::ReactNativeStaticServer
