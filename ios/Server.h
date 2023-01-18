static NSString * const CRASHED = @"CRASHED";
static NSString * const LAUNCHED = @"LAUNCHED";
static NSString * const TERMINATED = @"TERMINATED";

typedef void (^SignalConsumer)(NSString * const signal);

@interface Server : NSThread
- (void) cancel;
- (void) main;
+ (Server*) serverWithConfig:(NSString*)configPath
    signalConsumer:(SignalConsumer)signalConsumer;
@property SignalConsumer signalConsumer;
@end
