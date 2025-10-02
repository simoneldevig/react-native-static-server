#import "Errors.h"

static NSString * const ERROR_DOMAIN = @"RNStaticServer";

@implementation RNSSException;

- (id) initWithName:(NSString*)name details:(NSString*)details
{
  self = [super initWithName:name reason:details userInfo:nil];
  return self;
}

/**
 * Creates a new NSError object based on this RNSSException
 */
- (NSError*) error
{
  return [NSError
          errorWithDomain: ERROR_DOMAIN
          code: self.code
          userInfo: self.userInfo
  ];
}

- (RNSSException*) log
{
  NSLog(@"%@: %@", self.name, self.reason);
  return self;
}

- (void) reject: (RCTPromiseRejectBlock)reject
{
  reject(self.name, self.reason, [self error]);
}

+ (RNSSException*) from: (NSException*)exception
{
  return [[RNSSException alloc]
          initWithName: exception.name
          reason: exception.reason
          userInfo: exception.userInfo
  ];
}

+ (RNSSException*) name: (NSString*)name
{
  return [[RNSSException alloc] initWithName:name details:nil];
}

+ (RNSSException*) name: (NSString*)name details:(NSString*)details
{
  return [[RNSSException alloc] initWithName:name details:details];
}

@end;
