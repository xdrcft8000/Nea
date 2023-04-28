//
//  AuthAndBlock.m
//  Nea
//
//  Created by Tayyeb Rafique on 23/04/2023.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(AuthAndBlock, NSObject)

RCT_EXTERN_METHOD(reqAuth:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkAuth:(RCTResponseSenderBlock)callback)

@end


