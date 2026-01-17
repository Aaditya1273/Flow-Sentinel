const fs = require('fs')
const path = require('path')

// Flow CLI deployment script for strategy contracts
const deployStrategies = async () => {
  console.log('🚀 Deploying Flow Sentinel Strategy Contracts to Testnet...')
  
  const contractsToDeployment = [
    'LiquidStakingStrategy',
    'YieldFarmingStrategy', 
    'ArbitrageStrategy',
    'StrategyRegistry'
  ]
  
  try {
    // Read the current flow.json to get account info
    const flowConfig = JSON.parse(fs.readFileSync('flow.json', 'utf8'))
    const testnetAccount = flowConfig.accounts.testnet
    
    console.log(`📋 Deploying to account: ${testnetAccount.address}`)
    
    for (const contractName of contractsToDeployment) {
      console.log(`\n📄 Deploying ${contractName}...`)
      
      // Deploy each contract using Flow CLI
      const deployCommand = `flow accounts add-contract ${contractName} ./contracts/strategies/${contractName}.cdc --network testnet --signer testnet`
      
      console.log(`Running: ${deployCommand}`)
      
      // In a real deployment, you would execute this command
      // For now, we'll just log the commands that should be run
      console.log(`✅ ${contractName} deployment command prepared`)
    }
    
    // Deploy the main StrategyRegistry contract
    console.log(`\n📄 Deploying StrategyRegistry...`)
    const registryCommand = `flow accounts add-contract StrategyRegistry ./contracts/StrategyRegistry.cdc --network testnet --signer testnet`
    console.log(`Running: ${registryCommand}`)
    console.log(`✅ StrategyRegistry deployment command prepared`)
    
    console.log('\n🎉 All strategy contracts prepared for deployment!')
    console.log('\n📝 Manual Deployment Steps:')
    console.log('1. Run the following commands in your terminal:')
    
    contractsToDeployment.forEach(contract => {
      console.log(`   flow accounts add-contract ${contract} ./contracts/strategies/${contract}.cdc --network testnet --signer testnet`)
    })
    
    console.log(`   flow accounts add-contract StrategyRegistry ./contracts/StrategyRegistry.cdc --network testnet --signer testnet`)
    
    console.log('\n2. Update your .env.local file with the deployed contract addresses')
    console.log('3. Initialize the StrategyRegistry by calling the init transaction')
    
  } catch (error) {
    console.error('❌ Error preparing deployment:', error)
  }
}

// Initialize the strategy registry after deployment
const initializeRegistry = () => {
  console.log('\n🔧 Strategy Registry Initialization Transaction:')
  console.log(`
transaction() {
    prepare(signer: auth(SaveValue, IssueStorageCapabilityController, PublishCapability) &Account) {
        // Create and save the registry
        let registry <- StrategyRegistry.createRegistry()
        signer.storage.save(<-registry, to: StrategyRegistry.RegistryStoragePath)
        
        // Create public capability
        let cap = signer.capabilities.storage.issue<&StrategyRegistry.Registry{StrategyRegistry.RegistryPublic}>(StrategyRegistry.RegistryStoragePath)
        signer.capabilities.publish(cap, at: StrategyRegistry.RegistryPublicPath)
    }
}
  `)
}

// Run the deployment preparation
deployStrategies()
initializeRegistry()

module.exports = { deployStrategies, initializeRegistry }