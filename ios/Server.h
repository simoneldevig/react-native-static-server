static NSString * const CRASHED = @"CRASHED";
static NSString * const LAUNCHED = @"LAUNCHED";
static NSString * const TERMINATED = @"TERMINATED";

typedef void (^SignalConsumer)(NSString * const signal, NSString * const details);

@interface Server : NSThread
- (void) cancel;
- (void) main;

+ (Server*) serverWithId:(NSNumber*)serverId
    configPath:(NSString*)configPath
    errlogPath:(NSString*)errlogPath
    signalConsumer:(SignalConsumer)signalConsumer;

@property (readonly) NSNumber *serverId;
@property SignalConsumer signalConsumer;
@end
