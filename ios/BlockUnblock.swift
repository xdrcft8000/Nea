//
//  BlockUnblock.swift
//  Nea
//
//  Created by Tayyeb Rafique on 26/04/2023.
//

import Foundation
import ManagedSettings
import DeviceActivity
import FamilyControls

@available(iOS 16.0, *)
extension DeviceActivityName{
  static let activity = Self("activity")
}


@available(iOS 16.0, *)
extension ManagedSettingsStore.Name{
  static let study = Self("study")
}


@available(iOS 16.0, *)
@objc(BlockUnblock)
class BlockUnblock: NSObject {
  
  private let deciveActivityCenter = DeviceActivityCenter()

  @objc
  static func requiresMainQueueSetup() -> Bool{
    return true
  }
  
  @objc
  func createBlock(_ selection:String, duration:Int){

    let trimmedselection = String(selection.dropFirst().dropLast())
    let regex = try! NSRegularExpression(pattern: "(\\\\)([\"]|[/])")
    let outputString = regex.stringByReplacingMatches(in: trimmedselection, range: NSRange(trimmedselection.startIndex..., in: trimmedselection), withTemplate: "$2")

    let decoder = JSONDecoder()
    
    guard let decodedSelectionData = outputString.data(using: .utf8) else {
        print("Failed to convert selection string to data")
        exit(1)
    }


    guard let decodedSelection = try? decoder.decode(FamilyActivitySelection.self, from: decodedSelectionData) else {
        print("Failed to decode selection")
        exit(1)
    }
    let studyApps = decodedSelection.categoryTokens
    let studyStore = ManagedSettingsStore(named: .study)
    studyStore.shield.applications = decodedSelection.applicationTokens
    studyStore.shield.webDomains = decodedSelection.webDomainTokens
    studyStore.shield.webDomainCategories = .specific(studyApps)
    studyStore.shield.applicationCategories = .specific(studyApps)
    
    
    let date = Date()
    let calendar = Calendar.current
    let minutes = calendar.component(.minute, from: date)

    
    let end = (minutes + (duration/60)) % 59
    
    do{
      try deciveActivityCenter.startMonitoring(.activity,
                                                during: DeviceActivitySchedule(
                                                  intervalStart:DateComponents(minute:minutes),
                                                  intervalEnd:DateComponents(minute:end),
                                                  repeats: true))
    }catch{
      print(error)
    }
  }

  @objc
  func endBlock(){
    let studyStore = ManagedSettingsStore(named: .study)
    studyStore.clearAllSettings()
  }
}
