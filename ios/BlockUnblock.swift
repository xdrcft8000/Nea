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
    studyStore.shield.webDomainCategories = .specific(studyApps)
    studyStore.shield.applicationCategories = .specific(studyApps)
    print("BLOCKING SUCCESS")
    
//    DispatchQueue.main.asyncAfter(deadline: .now() + 60) {
//      studyStore.clearAllSettings();
//    };
    
    let date = Date()
    let calendar = Calendar.current
    let minutes = calendar.component(.minute, from: date)

    print("Minutes past the hour: " , minutes) // this will print the number of minutes past the hour as an integer
    
    let end = (minutes + (duration/60)) % 59
    
    print("End time: ", end)
    do{
      try deciveActivityCenter.startMonitoring(.activity,
                                                during: DeviceActivitySchedule(
                                                  intervalStart:DateComponents(minute:minutes),
                                                  intervalEnd:DateComponents(minute:end),
                                                  repeats: true))
      print("SHEDULE SET")
    }catch{
      print(error)
    }
  }

  @objc
  func endBlock(){
    print("END BLOCK")
    let studyStore = ManagedSettingsStore(named: .study)
    studyStore.clearAllSettings()
  }
}
