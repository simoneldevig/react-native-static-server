#pragma once

#include "codegen/NativeReactNativeStaticServerSpec.g.h"

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

    void sendEvent(std::string signal, std::string details);

    REACT_METHOD(getActiveServerId)
    void getActiveServerId(React::ReactPromise<std::optional<double>>&& result) noexcept;

    REACT_METHOD(getLocalIpAddress)
    void getLocalIpAddress(React::ReactPromise<std::string>&& result) noexcept;

    REACT_METHOD(getOpenPort)
    void getOpenPort(std::string address, React::ReactPromise<double>&& result) noexcept;

    REACT_METHOD(start)
    void start(double id,
        std::string configPath,
        std::string errlogPath,
        React::ReactPromise<std::string>&& result) noexcept;

    REACT_METHOD(stop)
    void stop(React::ReactPromise<std::string>&& result) noexcept;
};

} // namespace winrt::ReactNativeStaticServer
