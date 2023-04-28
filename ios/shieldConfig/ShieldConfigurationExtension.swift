//
//  ShieldConfigurationExtension.swift
//  shieldConfig
//
//  Created by Tayyeb Rafique on 26/04/2023.
//

import ManagedSettings
import ManagedSettingsUI
import UIKit

// Override the functions below to customize the shields used in various situations.
// The system provides a default appearance for any methods that your subclass doesn't override.
// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    override func configuration(shielding application: Application) -> ShieldConfiguration {
      ShieldConfiguration(
        title: ShieldConfiguration.Label(text: "nea says not now, it's time to study", color: .blue),
        subtitle: ShieldConfiguration.Label(text: "open nea to see how much time you have left", color: .white)
      )
    }
    
    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        // Customize the shield as needed for applications shielded because of their category.
        ShieldConfiguration(        title: ShieldConfiguration.Label(text: "Nea says not now, it's time to study", color: .blue)
)
    }
    
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        // Customize the shield as needed for web domains.
        ShieldConfiguration(        title: ShieldConfiguration.Label(text: "Nea says not now, it's time to study", color: .blue)
)
    }
    
    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        // Customize the shield as needed for web domains shielded because of their category.
        ShieldConfiguration(        title: ShieldConfiguration.Label(text: "Nea says not now, it's time to study", color: .blue)
)
    }
}
