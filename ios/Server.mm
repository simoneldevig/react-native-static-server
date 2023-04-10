#import "Server.h"

Server *activeServer;

void onLaunchedCallback() {
  activeServer.signalConsumer(LAUNCHED, nil);
}

extern "C" {
  int lighttpd_launch(const char * config_path, void (*cb)());
  void lighttpd_graceful_shutdown();
}

@implementation Server {
  NSString *configPath;
}

- (id) initWithConfig:(NSString*)configPath
         signalConsumer:(SignalConsumer)signalConsumer
{
  self = [super init];
  self->configPath = configPath;
  self.signalConsumer = signalConsumer;
  return self;
}

- (void) cancel {
  NSLog(@"Server.cancel() triggered");
  lighttpd_graceful_shutdown();
  [super cancel];
}

- (void) main {
  NSLog(@"Server.main() triggered");

  if (activeServer) {
    NSString *msg = @"Another Server instance is active";
    NSLog(@"%@", msg);
    self.signalConsumer(CRASHED, msg);
    return;
  }

  @try {
    activeServer = self;
    int res = lighttpd_launch(
      [self->configPath cStringUsingEncoding:NSASCIIStringEncoding],
      onLaunchedCallback
    );
    if (res) [NSException raise:@"Server exited with error" format:@"%d", res];
    NSLog(@"Server terminated gracefully");
    self.signalConsumer(TERMINATED, nil);
  }
  @catch (NSException *error) {
    NSLog(@"Server crashed %@", error.name);
    self.signalConsumer(CRASHED, error.name);
  }
  @finally {
    activeServer = NULL;
  }
}

+ (Server*) serverWithConfig:(NSString*)configPath
              signalConsumer:(SignalConsumer)signalConsumer
{
  return [[Server alloc]
    initWithConfig: configPath
    signalConsumer: signalConsumer];
}

@end
