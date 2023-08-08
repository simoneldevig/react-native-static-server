//
//  Errors.h
//  ReactNativeStaticServer
//
//  Created by Sergey Pogodin on 10/4/23.
//

#ifndef Errors_h
#define Errors_h

#import <React/RCTBridgeModule.h>

@interface RNSSException : NSException
- (id) initWithName: (NSString*)name details: (NSString*)details;
- (NSError*) error;
- (RNSSException*) log;
- (void) reject:(RCTPromiseRejectBlock)reject;
+ (RNSSException*) from: (NSException*)exception;
+ (RNSSException*) name: (NSString*)name;
+ (RNSSException*) name: (NSString*)name details: (NSString*)details;

@property(readonly) NSInteger code;
@end

#endif /* Errors_h */
