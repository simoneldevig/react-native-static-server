//
//  Errors.h
//  ReactNativeStaticServer
//
//  Created by Sergey Pogodin on 10/4/23.
//

#ifndef Errors_h
#define Errors_h

#import <React/RCTBridgeModule.h>

@interface RNException : NSException
- (id) initWithName: (NSString*)name details: (NSString*)details;
- (NSError*) error;
- (RNException*) log;
- (void) reject:(RCTPromiseRejectBlock)reject;
+ (RNException*) from: (NSException*)exception;
+ (RNException*) name: (NSString*)name;
+ (RNException*) name: (NSString*)name details: (NSString*)details;

@property(readonly) NSInteger code;
@end

#endif /* Errors_h */
