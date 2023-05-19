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
    ZStack {
      Color(red:0.949,green:0.949,blue:0.949)

      Image("neastarlogocropped")
        .resizable()
                      .frame(width: 100, height: 50)
                      .padding()
                      .position(x: 70, y: 70)

      VStack {
        Text("Use nea when you want to focus instead of uninstalling your favourite apps.")
          .padding(.horizontal,60).padding(.vertical,20).multilineTextAlignment(.center).font(Font.custom("Arial", size: 16)).foregroundColor(.black)
        
        Text("If you need to use a blocked app, try making a note, then waiting until break.")
          .padding(.horizontal,60).padding(.vertical,20).multilineTextAlignment(.center).font(Font.custom("Arial", size: 16)).foregroundColor(.black)
        
        Text("Over time, your brain will learn to check your phone less, improving your focus.")
          .padding(.horizontal,60).padding(.vertical,20).multilineTextAlignment(.center).font(Font.custom("Arial", size: 16)).foregroundColor(.black)
        if #available(iOS 16, *) {
        Button("Pick Your Most Distracting Apps"){bbool = true}
          .padding(.top,40).familyActivityPicker(isPresented:$bbool, selection:$selection)
        if selection.applications.count > 50 {
          Text("Only select up to 50 apps, try selecting only the most distracting  categories like 'Social' and 'Entertainment'") .padding(.horizontal,60).padding(.vertical,5).multilineTextAlignment(.center).font(Font.custom("Arial", size: 14)).foregroundColor(.red).bold()
        }
          } else {
                    Text("Sorry, nea is only available on iOS 16+")
                        .foregroundColor(.red)
                        .font(.headline)
                }

      }
      }
    .onChange(of: selection) { newSelection in
      if selection.applications.count<51{
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(selection) else {
          print("Failed to encode selection")
          exit(1)
        }
        let selectionString = String(data: data, encoding: .utf8)!
        self.props.onCountChange(["count": selectionString])
      }
    }
    
    
  }
}

