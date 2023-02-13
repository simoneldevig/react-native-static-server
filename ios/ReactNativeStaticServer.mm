#import "ReactNativeStaticServer.h"
#import "Server.h"
#import <ifaddrs.h>
#import <arpa/inet.h>
#include <net/if.h>

static NSString * const ERROR_DOMAIN = @"RNStaticServer";
static NSString * const EVENT_NAME = @"RNStaticServer";

@implementation ReactNativeStaticServer {
    Server *server;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
  return [super init];
}

- (void)dealloc {
  if (self->server) {
    [self->server cancel];
  }
}

- (NSDictionary*) constantsToExport {
  return @{
    @"CRASHED": CRASHED,
    @"LAUNCHED": LAUNCHED,
    @"TERMINATED": TERMINATED
  };
}

- (NSDictionary*) getConstants {
  return [self constantsToExport];
}

RCT_REMAP_METHOD(getLocalIpAddress,
  getLocalIpAddress:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
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
}

RCT_REMAP_METHOD(isRunning,
  isRunning:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
  resolve(@(self->server && self->server.executing));
}

RCT_REMAP_METHOD(start,
  start:(NSNumber* _Nonnull)serverId
  configPath:(NSString*)configPath
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
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
}

- (NSArray<NSString *> *)supportedEvents {
  return @[EVENT_NAME];
}

RCT_REMAP_METHOD(stop,
  stop:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
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
}

RCT_REMAP_METHOD(getOpenPort,
  getOpenPort:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
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
}

- (void) startObserving {
  // NOOP: Triggered when the first listener from JS side is added.
}

- (void) stopObserving {
  // NOOP: Triggered when the last listener from JS side is removed.
}

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeReactNativeStaticServerSpecJSI>(params);
}
#endif

@end
