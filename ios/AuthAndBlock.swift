//
//  AuthAndBlock.swift
//  Nea
//
//  Created by Tayyeb Rafique on 23/04/2023.
//

import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity





@available(iOS 16.0, *)
@objc(AuthAndBlock)
class AuthAndBlock: NSObject {
  

  private let center = AuthorizationCenter.shared;
  private let deciveActivityCenter = DeviceActivityCenter()
    
  @objc
  static func requiresMainQueueSetup() -> Bool{
    return true
  }
  
  @objc
  func reqAuth(_ resolve: @escaping RCTPromiseResolveBlock , reject: @escaping RCTPromiseRejectBlock) {Task.detached {
    do{
      try await self.center.requestAuthorization(for: .individual)
      resolve("Auth granted")
    } catch {
      reject("error", "err", error)
    }
  }
  }
  
  @objc
  func checkAuth(_ callback:RCTResponseSenderBlock) {
    let status = center.authorizationStatus
    print(status.rawValue)
    switch status {
    case .approved:
      callback([true])
    default:
      callback([false])
    }
  }
}
