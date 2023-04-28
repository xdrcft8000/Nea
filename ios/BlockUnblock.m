//
//  BlockUnblock.m
//  Nea
//
//  Created by Tayyeb Rafique on 26/04/2023.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(BlockUnblock, NSObject)
RCT_EXTERN_METHOD(createBlock:(NSString *)selection duration:(NSInteger *)duration)
RCT_EXTERN_METHOD(endBlock)
@end
