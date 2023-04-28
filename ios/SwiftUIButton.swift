//
//  SwiftUIButton.swift
//  ReactNativeWithSwiftUITutorial
//
//  Created by Alexey Kureev on 01/02/2020.
//
import SwiftUI
import FamilyControls
import ManagedSettings
import ScreenTime

@available(iOS 16.0, *)
class ButtonProps : ObservableObject {
  @Published var count: Int = 0
  @Published var onCountChange: RCTDirectEventBlock = { _ in }
  @Published var categoryTokens: Set<ActivityCategoryToken> = []
  
}

@available(iOS 16.0, *)
struct SwiftUIButton : View {
  @ObservedObject var props = ButtonProps()
  @State var bbool = false
  @State var selection = FamilyActivitySelection(includeEntireCategory: true)
  @State var isAuthorized = false
  let center = AuthorizationCenter.shared;


  var body: some View {
    VStack {
      Spacer()
      Text("nea helps you study by blocking your distracting apps for short focus periods.")
        .padding(10).multilineTextAlignment(.center)
      
      Text("You won't be able to access the blocked apps until the focus period ends.")
        .padding(10).multilineTextAlignment(.center)
      
      Text("Pick your most distracting apps to block. Change your selection from the settings")
        .padding(10).multilineTextAlignment(.center)
      Spacer()
      Button("Pick Apps"){bbool = true}
        .familyActivityPicker(isPresented:$bbool, selection:$selection)
    }
    .onChange(of: selection) { newSelection in
      let encoder = JSONEncoder()
      guard let data = try? encoder.encode(selection) else {
          print("Failed to encode selection")
          exit(1)
      }
      let selectionString = String(data: data, encoding: .utf8)!
      print("Encoded selection: \(selectionString)")
      self.props.onCountChange(["count": selectionString])
             }
    .padding(.bottom,175)

  }
}

