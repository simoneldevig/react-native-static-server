#pragma once

#include "NativeReactNativeStaticServerSpec.g.h"

#include "JSValue.h"
#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::ReactNativeStaticServer
{

static const std::string CRASHED = "CRASHED";
static const std::string LAUNCHED = "LAUNCHED";
static const std::string TERMINATED = "TERMINATED";

REACT_MODULE(ReactNativeModule, L"ReactNativeStaticServer")
struct ReactNativeModule
{
    using ModuleSpec = ReactNativeStaticServerSpec;

    REACT_GET_CONSTANTS(GetConstants)
    ReactNativeStaticServerSpec_Constants GetConstants() noexcept {
        ReactNativeStaticServerSpec_Constants res;
        res.CRASHED = CRASHED;
        res.LAUNCHED = LAUNCHED;
        res.TERMINATED = TERMINATED;
        return res;
    }

    REACT_METHOD(isRunning)
    void isRunning(React::ReactPromise<React::JSValue> &&result) noexcept {
        result.Reject("NOT IMPLEMENTED YET");
        /*
            ANDROID:
             promise.resolve(server != null && server.isAlive());
            IOS:

resolve(@(self->server && self->server.executing));
        */
    }

    REACT_METHOD(addListener)
    void addListener(std::string eventName) noexcept {
        // NOOP
    }

    REACT_METHOD(removeListeners)
    void removeListeners(double count) noexcept {
        // NOOP
    }

    REACT_METHOD(start)
    void start(double id, std::string configPath, React::ReactPromise<::React::JSValue> &&result) noexcept {
        result.Reject("NOT IMPLEMENTED YET");

        /*
            ANDROID:

               Log.i(LOGTAG, "Starting...");

    if (server != null) {
      Errors.ANOTHER_INSTANCE_IS_ACTIVE.log().reject(promise);
      return;
    }

    DeviceEventManagerModule.RCTDeviceEventEmitter emitter =
      getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);

    server = new Server(
      configPath,
      new Consumer<String>() {
        private boolean settled = false;
        public void accept(String signal) {
          if (!settled) {
            settled = true;
            if (signal == Server.LAUNCHED) promise.resolve(null);
            else Errors.LAUNCH_FAILURE.reject(promise);
          }
          WritableMap event = Arguments.createMap();
          event.putDouble("serverId", id);
          event.putString("event", signal);
          emitter.emit("RNStaticServer", event);
        }
      }
    );
    server.start();

            IOS:

NSLog(@"Starting the server...");

    if (self->server) {
      NSString *msg = @"Another server instance is active";
      NSError *e = [NSError
        errorWithDomain:ERROR_DOMAIN
        code:12345
        userInfo:NULL
      ];
      NSLog(@"%@", msg);
      reject(e.domain, msg, e);
      return;
    }

    __block BOOL settled = false;
    SignalConsumer signalConsumer = ^void(NSString * const signal) {
      if (!settled) {
        settled = true;
        if (signal == LAUNCHED) {
          NSLog(@"SERVER LAUNCHED!");
          resolve(NULL);
        }
        else reject(ERROR_DOMAIN, @"Launch failure", NULL);
      }
      [self sendEventWithName:EVENT_NAME
        body: @{
          @"serverId": serverId,
          @"event": signal
        }
      ];
    };

    self->server = [Server
      serverWithConfig:configPath
      signalConsumer:signalConsumer
    ];

    [self->server start];

        */
    }

    REACT_METHOD(getLocalIpAddress)
    void getLocalIpAddress(React::ReactPromise<React::JSValue> &&result) noexcept {
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

    REACT_METHOD(getOpenPort)
    void getOpenPort(React::ReactPromise<React::JSValue> &&result) noexcept {
        result.Resolve(3000);

        /* TODO: For now we'll just always return 3000,
            below are Android and iOS implementations hinting
            what we really need here:

            ANDROID:

                try {
      ServerSocket socket = new ServerSocket(0);
      int port = socket.getLocalPort();
      socket.close();
      promise.resolve(port);
    } catch (Exception e) {
      Errors.FAIL_GET_OPEN_PORT.log(e).reject(promise);
    }

            IOS:

            @try {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
      reject(ERROR_DOMAIN, @"Error creating socket", NULL);
      return;
    }

    struct sockaddr_in serv_addr;
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    // INADDR_ANY is used to specify that the socket should be bound
    // to any available network interface.
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    serv_addr.sin_port = 0;

    if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) {
      reject(ERROR_DOMAIN, @"Error binding socket", NULL);
      return;
    }

    socklen_t len = sizeof(serv_addr);
    if (getsockname(sockfd, (struct sockaddr *) &serv_addr, &len) < 0) {
      reject(ERROR_DOMAIN, @"Error getting socket name", NULL);
      return;
    }
    int port = ntohs(serv_addr.sin_port);

    close(sockfd);
    resolve(@(port));
  }
  @catch (NSException *e) {
    NSError *error = [NSError errorWithDomain:ERROR_DOMAIN code:12345 userInfo:e.userInfo];
    reject(e.name, e.reason, error);
  }
        */
    }

    REACT_METHOD(stop)
    void stop(React::ReactPromise<React::JSValue> &&result) noexcept {
        result.Reject("NOT IMPLEMENTED YET");
        /*
            ANDROID:
            
                try {
      Log.i(LOGTAG, "stop() triggered.");
      if (server != null) {
        server.interrupt();
        server.join();
        server = null;
        Log.i(LOGTAG, "Active server stopped");
      } else Log.i(LOGTAG, "No active server");
      if (promise != null) promise.resolve(null);
    } catch (Exception e) {
      Errors.STOP_FAILURE.log(e).reject(promise);
    }

            IOS:

              try {
    if (self->server) {
      NSLog(@"Stopping...");
      [self->server cancel];
      // TODO: In Java we do server.join() here to wait for server thread to exit,
      // can't find counterpart of .join() for NSThread. Probably, there is
      // another way to do it, and we should use it.
      self->server = NULL;
      NSLog(@"Stopped");
      resolve(NULL);
    }
  } catch (NSException *e) {
    NSString *msg = @"Failed to stop";
    NSLog(@"%@", msg);
    reject(e.name, msg, NULL);
  }
        */
    }
};

} // namespace winrt::ReactNativeStaticServer
