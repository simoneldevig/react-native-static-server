#import "ReactNativeStaticServer.h"
#import "Server.h"
#import "Errors.h"
#import <ifaddrs.h>
#import <arpa/inet.h>
#include <net/if.h>

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
    [[RNException from:e] reject:reject];
  }
  @finally {
    freeifaddrs(interfaces);
  }
}

RCTPromiseResolveBlock pendingResolve = nil;
RCTPromiseRejectBlock pendingReject = nil;

RCT_REMAP_METHOD(start,
  start:(NSNumber* _Nonnull)serverId
  configPath:(NSString*)configPath
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
    NSLog(@"Starting the server...");

    if (self->server) {
      auto e = [[RNException name:@"Another server instance is active"] log];
      [e reject:reject];
      return;
    }

    if (pendingResolve != nil || pendingReject != nil) {
      auto e = [[RNException name:@"Internal error"
                          details:@"Non-expected pending promise"] log];
      [e reject:reject];
      return;
    }

    pendingResolve = resolve;
    pendingReject = reject;

    SignalConsumer signalConsumer = ^void(NSString * const signal,
                                          NSString * const details)
    {
      if (signal != LAUNCHED) self->server = nil;
      if (pendingResolve == nil && pendingReject == nil) {
        [self sendEventWithName:EVENT_NAME
          body: @{
            @"serverId": serverId,
            @"event": signal,
            @"details": details == nil ? @"" : details
          }
        ];
      } else {
        auto resolve = pendingResolve;
        auto reject = pendingReject;
        pendingResolve = nil;
        pendingReject = nil;
        if (signal == CRASHED) {
          [[RNException name:@"Server crashed" details:details]
           reject:reject];
        } else resolve(details);
      }
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

      if (pendingResolve != nil || pendingReject != nil) {
        auto e = [[RNException name:@"Internal error"
                            details:@"Unexpected pending promise"] log];
        [e reject:reject];
        return;
      }

      pendingResolve = resolve;
      pendingReject = reject;
      [self->server cancel];
    }
  } catch (NSException *e) {
    [[RNException from:e] reject:reject];
  }
}

RCT_REMAP_METHOD(getOpenPort,
  getOpenPort:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
  @try {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
      [[RNException name:@"Error creating socket"] reject:reject];
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
      [[RNException name:@"Error binding socket"] reject:reject];
      return;
    }

    socklen_t len = sizeof(serv_addr);
    if (getsockname(sockfd, (struct sockaddr *) &serv_addr, &len) < 0) {
      [[RNException name:@"Error getting socket name"] reject:reject];
      return;
    }
    int port = ntohs(serv_addr.sin_port);

    close(sockfd);
    resolve(@(port));
  }
  @catch (NSException *e) {
    [[RNException from:e] reject:reject];
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
