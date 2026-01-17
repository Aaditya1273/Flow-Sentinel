import StrategyRegistry from 0x136b642d0aa31ca9

// Initialize the Strategy Registry
// This transaction creates and saves the registry resource to the deployer's account
transaction() {
    prepare(signer: auth(SaveValue, IssueStorageCapabilityController, PublishCapability, BorrowValue) &Account) {
        // Check if registry already exists
        if signer.storage.borrow<&StrategyRegistry.Registry>(from: StrategyRegistry.RegistryStoragePath) != nil {
            log("StrategyRegistry already initialized")
            return
        }
        
        // Create and save the registry
        let registry <- StrategyRegistry.createRegistry()
        signer.storage.save(<-registry, to: StrategyRegistry.RegistryStoragePath)
        
        // Create public capability
        let cap = signer.capabilities.storage.issue<&{StrategyRegistry.RegistryPublic}>(StrategyRegistry.RegistryStoragePath)
        signer.capabilities.publish(cap, at: StrategyRegistry.RegistryPublicPath)
        
        log("StrategyRegistry initialized successfully")
    }
    
    execute {
        log("Strategy Registry is now available at: ".concat(StrategyRegistry.RegistryPublicPath.toString()))
    }
}