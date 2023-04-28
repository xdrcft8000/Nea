//#import <RCTAppDelegate.h>
//#import <UIKit/UIKit.h>
//
//@interface AppDelegate : RCTAppDelegate
//
//@end
//


#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
