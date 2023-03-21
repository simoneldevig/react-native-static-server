#include "pch.h"
#include "ReactNativeModule.h"
#include <ppltasks.h>

#include "Server.h"

using namespace std::chrono_literals;
using namespace winrt::ReactNativeStaticServer;

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
    result.Resolve("localhost");
    /*
        TODO: For now, we just always return "localhost",
        below is Java and iOS code of this method, showing
        what we really wanna do here (and also we should double-
        check we can't do the same already using rn-netinfo lib).

        JAVA IMPLEMENTATION:

        try {
            Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();
            while(en.hasMoreElements()) {
                NetworkInterface intf = en.nextElement();
                Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses();
                while(enumIpAddr.hasMoreElements()) {
                InetAddress inetAddress = enumIpAddr.nextElement();
                if (!inetAddress.isLoopbackAddress()) {
                    String ip = inetAddress.getHostAddress();
                    if(InetAddressUtils.isIPv4Address(ip)) {
                    promise.resolve(ip);
                    return;
                    }
                }
                }
            }
            promise.resolve("localhost");
            } catch (Exception e) {
            Errors.FAIL_GET_LOCAL_IP_ADDRESS.reject(promise);
        }

        OBJECTIVE-C IMPLEMENTATION:

        struct ifaddrs *interfaces = NULL; // a linked list of network interfaces
        @try {
            struct ifaddrs *temp_addr = NULL;
            int success = getifaddrs(&interfaces); // get the list of network interfaces
            if (success == 0) {
            NSLog(@"Found network interfaces, iterating.");
            temp_addr = interfaces;
            while(temp_addr != NULL) {
                // Check if the current interface is of type AF_INET (IPv4)
                // and not the loopback interface (lo0)
                if(temp_addr->ifa_addr->sa_family == AF_INET) {
                if([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"]) {
                    NSLog(@"Found IPv4 address of the local wifi connection. Returning address.");
                    NSString *ip = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
                    resolve(ip);
                    return;
                }
                }
                temp_addr = temp_addr->ifa_next;
            }
            }
            NSLog(@"Could not find IP address, falling back to localhost.");
            resolve(@"localhost");
        }
        @catch (NSException *e) {
            // TODO: First, it is probably not the best way to map NSException fields
            // into NSError object; second, we should adopt approach from Android code,
            // where there is a dedicated error handling and reporting singletone, which
            // simplifies such error handling with promise rejection and optional logging.
            NSError *error = [NSError errorWithDomain:ERROR_DOMAIN code:12345 userInfo:e.userInfo];
            reject(e.name, e.reason, error);
        }
        @finally {
            freeifaddrs(interfaces);
        }
    */
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
