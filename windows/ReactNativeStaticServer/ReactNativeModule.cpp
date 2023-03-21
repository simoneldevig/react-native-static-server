#include "pch.h"
#include "ReactNativeModule.h"
#include <ppltasks.h>

#include "Server.h"

using namespace std::chrono_literals;
using namespace winrt::ReactNativeStaticServer;
using namespace winrt::Windows::Networking::Connectivity;

double activeServerId;
ReactNativeModule* mod;
React::ReactPromise<::React::JSValue>* pendingResultPromise;
Server *server;

void OnLaunchedCallback(std::string signal) {
    if (pendingResultPromise) {
        if (signal == LAUNCHED) pendingResultPromise->Resolve(NULL);
        else {
            // TODO: There is an elegant solution in Android/Java version
            // of the native code, that prevents having error-handling
            // boilerplate all around, instead encapsulating it in a dedicated
            // error-handling module. Should adopt it for Windows eventually.
            auto error = winrt::Microsoft::ReactNative::ReactError();
            error.Message = "Native server failed to launch";
            pendingResultPromise->Reject(error);
        }
        delete pendingResultPromise;
        pendingResultPromise = NULL;
    }
    mod->sendEvent(signal);
}

ReactNativeStaticServerSpec_Constants ReactNativeModule::GetConstants() noexcept {
    ReactNativeStaticServerSpec_Constants res;
    res.CRASHED = CRASHED;
    res.LAUNCHED = LAUNCHED;
    res.TERMINATED = TERMINATED;
    return res;
}

void ReactNativeModule::getLocalIpAddress(React::ReactPromise<React::JSValue>&& result) noexcept {
    try {
        auto hosts = NetworkInformation::GetHostNames();
        for (winrt::Windows::Networking::HostName host: hosts) {
            if (host.Type() == winrt::Windows::Networking::HostNameType::Ipv4) {
                auto network = host.IPInformation().NetworkAdapter();
                int32_t netType = network.IanaInterfaceType();
                // TODO: This needs second thoughts, and a lot of testing.
                // The current values 6 & 72 mean "either Ethernet network,
                // or IEEE 802.11 wireless network interface", see:
                // https://learn.microsoft.com/en-us/uwp/api/windows.networking.connectivity.networkadapter.ianainterfacetype?view=winrt-22621#property-value
                // For now we just pick up the first IP for such connected
                // network, but we probably should give library consumer
                // control over what network is selected, and stuff (there
                // are related tickets for other os).
                if (netType == 6 || netType == 71) {
                    // TODO: Here we can use network.GetConnectedProfileAsync()
                    // to get more info about the current connection status,
                    // but for now just let return the first IP we found.
                    result.Resolve(winrt::to_string(host.CanonicalName()));
                }
            }
        }
        throw "Failed to find non-local IP address";
    }
    catch (...) {
        auto error = winrt::Microsoft::ReactNative::ReactError();
        error.Message = "Failed to get a non-local IP address";
        result.Reject(error);
    }
}

void ReactNativeModule::getOpenPort(React::ReactPromise<React::JSValue>&& result) noexcept {
    try {
        auto socket = winrt::Windows::Networking::Sockets::StreamSocketListener();
        // TODO: This will fail if nor InternetClientServer neither PrivateNetworkClientServer
        // capability is granted to the app. The error messaging should be improved, to make it
        // clear to the library consumer why the failure happened.
        if (socket.BindServiceNameAsync(L"").wait_for(5s) != AsyncStatus::Completed) {
            throw "Binding time out";
        }
        double port = std::stod(winrt::to_string(socket.Information().LocalPort()));
        socket.Close();
        result.Resolve(port);
    }
    catch (...) {
        auto error = winrt::Microsoft::ReactNative::ReactError();
        error.Message = "Failed to get an open port";
        result.Reject(error);
    }
}

void ReactNativeModule::isRunning(React::ReactPromise<React::JSValue>&& result) noexcept {
    result.Reject("NOT IMPLEMENTED YET");
    /*
        ANDROID:
         promise.resolve(server != null && server.isAlive());
        IOS:

resolve(@(self->server && self->server.executing));
        */
}

void ReactNativeModule::sendEvent(std::string signal) {
    JSValueObject obj = JSValueObject{
            {"serverId", activeServerId},
            {"event", signal},
    };
    this->EmitEvent(std::move(obj));
}

void ReactNativeModule::start(
    double id,
    std::string configPath,
    React::ReactPromise<::React::JSValue>&& result
) noexcept {
    if (server) {
        auto error = winrt::Microsoft::ReactNative::ReactError();
        error.Message = "Another server instance is active";
        result.Reject(error);
        return;
    }
    mod = this;
    activeServerId = id;
    pendingResultPromise = new React::ReactPromise<React::JSValue>(result);
    server = new Server(configPath, OnLaunchedCallback);
    server->launch();
}

void ReactNativeModule::stop(React::ReactPromise<React::JSValue>&& result) noexcept {
    try {
        if (server) {
            server->shutdown();
            delete server;
            server = NULL;
        }
        if (pendingResultPromise) {
            delete pendingResultPromise;
            pendingResultPromise = NULL;
        }
        // TODO: Well... this is not quite correct, we should instead
        // syncronize this promise resolution with the Server sending
        // out TERMINATED signal, similarly to how we do on the startup
        // with the LAUNCHED signal. Will do without synchronization
        // for now: should not cause troubles apart of edge cases when
        // somebody tries to start a server immediately after previos
        // .stop() call resolved.
        result.Resolve(NULL);
    }
    catch (...) {
        auto error = winrt::Microsoft::ReactNative::ReactError();
        error.Message = "Failed to gracefully shutdown the server";
        result.Reject(error);
    }
}
