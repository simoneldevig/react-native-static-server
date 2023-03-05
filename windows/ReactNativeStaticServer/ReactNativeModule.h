#pragma once

#include "NativeReactNativeStaticServerSpec.g.h"

#include "JSValue.h"
#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::ReactNativeStaticServer
{

REACT_MODULE(ReactNativeModule, L"ReactNativeStaticServer")
struct ReactNativeModule
{
    using ModuleSpec = ReactNativeStaticServerSpec;

    REACT_GET_CONSTANTS(GetConstants)
    ReactNativeStaticServerSpec_Constants GetConstants() noexcept;

    REACT_METHOD(isRunning)
    void isRunning(React::ReactPromise<React::JSValue>&& result) noexcept;

    REACT_METHOD(addListener)
    void addListener(std::string eventName) noexcept {
        // NOOP
    }

    REACT_METHOD(removeListeners)
    void removeListeners(double count) noexcept {
        // NOOP
    }

    REACT_EVENT(EmitEvent, L"RNStaticServer");
    std::function<void(JSValue)> EmitEvent;

    void sendEvent(std::string signal);

    REACT_METHOD(getLocalIpAddress)
    void getLocalIpAddress(React::ReactPromise<React::JSValue>&& result) noexcept;

    REACT_METHOD(getOpenPort)
    void getOpenPort(React::ReactPromise<React::JSValue>&& result) noexcept;

    REACT_METHOD(start)
    void start(double id, std::string configPath, React::ReactPromise<::React::JSValue>&& result) noexcept;

    REACT_METHOD(stop)
    void stop(React::ReactPromise<React::JSValue>&& result) noexcept;
};

} // namespace winrt::ReactNativeStaticServer
