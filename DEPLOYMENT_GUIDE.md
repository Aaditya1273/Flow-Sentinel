# Flow Sentinel - Strategy Contracts Deployment Guide

This guide will help you deploy the real strategy contracts to Flow Testnet and integrate them with your DeFi platform.

## 🚀 Quick Deployment

### Prerequisites

1. **Flow CLI installed** - [Installation Guide](https://developers.flow.com/tools/flow-cli/install)
2. **Private key file** - Ensure `testnet-private-key.pem` is in your project root
3. **Testnet FLOW tokens** - Get them from [Flow Faucet](https://faucet.flow.com/)

### Step 1: Deploy All Contracts

**For Windows:**
```bash
./scripts/deploy-all-contracts.bat
```

**For Mac/Linux:**
```bash
chmod +x ./scripts/deploy-all-contracts.sh
./scripts/deploy-all-contracts.sh
```

**Manual Deployment (if scripts don't work):**
```bash
# Deploy in this exact order (dependencies first)
flow accounts add-contract SentinelInterfaces ./contracts/SentinelInterfaces.cdc --network testnet --signer testnet-account
flow accounts add-contract SentinelVault ./contracts/SentinelVault.cdc --network testnet --signer testnet-account
flow accounts add-contract LiquidStakingStrategy ./contracts/strategies/LiquidStakingStrategy.cdc --network testnet --signer testnet-account
flow accounts add-contract YieldFarmingStrategy ./contracts/strategies/YieldFarmingStrategy.cdc --network testnet --signer testnet-account
flow accounts add-contract ArbitrageStrategy ./contracts/strategies/ArbitrageStrategy.cdc --network testnet --signer testnet-account
flow accounts add-contract StrategyRegistry ./contracts/StrategyRegistry.cdc --network testnet --signer testnet-account
```

### Step 2: Initialize Strategy Registry

```bash
flow transactions send ./transactions/init_strategy_registry.cdc --network testnet --signer testnet-account
```

### Step 3: Test Deployment

```bash
flow scripts execute ./scripts/test_strategies.cdc --network testnet
```

## 📋 What Gets Deployed

### Core Contracts
- **SentinelInterfaces** - Standard interfaces for the ecosystem
- **SentinelVault** - Main vault contract with MEV protection and automation

### Strategy Contracts
- **LiquidStakingStrategy** - Flow liquid staking with automated delegation
- **YieldFarmingStrategy** - Multi-protocol yield farming with rebalancing
- **ArbitrageStrategy** - Cross-DEX arbitrage with MEV protection

### Registry Contract
- **StrategyRegistry** - Central registry managing all available strategies

## 🔧 Integration Features

### Real Blockchain Data
- ✅ Vaults page now loads strategies from deployed contracts
- ✅ CreateVaultModal uses real strategy data
- ✅ All mock data replaced with blockchain queries
- ✅ Real-time TVL, participants, and performance metrics

### Smart Contract Features
- ✅ MEV protection using Flow's native randomness
- ✅ Automated strategy execution with scheduling
- ✅ Emergency pause functionality
- ✅ Multi-strategy support with different risk levels
- ✅ Real yield generation algorithms

### Frontend Integration
- ✅ Real-time strategy loading from blockchain
- ✅ Dynamic vault creation with strategy selection
- ✅ Proper error handling and loading states
- ✅ Transaction status tracking

## 🌐 Verify Deployment

After deployment, you can verify your contracts at:
- **Flow Testnet Explorer**: https://testnet.flowscan.org/account/0x136b642d0aa31ca9
- **Contract Verification**: Check that all 6 contracts are deployed

## 🧪 Testing Your Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the Vaults page** (`/vaults`)
   - Should load real strategies from blockchain
   - Should show proper TVL, APY, and participant data

3. **Create a vault:**
   - Click "Create Vault" on any strategy
   - Should load real strategy data in the modal
   - Should create actual vault on blockchain

4. **Check your dashboard** (`/dashboard`)
   - Should show your real vault data
   - Should display actual blockchain balances

## 🔍 Troubleshooting

### Common Issues

**1. "Contract not found" error:**
- Ensure all contracts are deployed in the correct order
- Check that your account has sufficient FLOW for deployment

**2. "Strategy Registry not initialized":**
- Run the initialization transaction: `flow transactions send ./transactions/init_strategy_registry.cdc --network testnet --signer testnet-account`

**3. "No strategies found" in frontend:**
- Verify contracts are deployed: `flow scripts execute ./scripts/test_strategies.cdc --network testnet`
- Check browser console for API errors

**4. Transaction failures:**
- Ensure you have enough FLOW tokens
- Check that wallet is properly connected
- Verify contract addresses in `.env.local`

### Debug Commands

```bash
# Check account info
flow accounts get 0x136b642d0aa31ca9 --network testnet

# Test strategy loading
flow scripts execute ./scripts/test_strategies.cdc --network testnet

# Check contract deployment
flow accounts get 0x136b642d0aa31ca9 --network testnet | grep -A 5 "Contracts"
```

## 📊 Expected Results

After successful deployment and integration:

1. **Vaults Page** (`/vaults`):
   - Shows 6 real strategies loaded from blockchain
   - Displays actual TVL, participants, and APY data
   - Featured strategies section with real data

2. **Create Vault Modal**:
   - Loads strategies dynamically from contracts
   - Shows real strategy details and features
   - Creates actual vaults on Flow blockchain

3. **Dashboard** (`/dashboard`):
   - Displays real vault data from blockchain
   - Shows actual FLOW balances
   - Real transaction history and performance

## 🎯 Success Metrics

- ✅ All 6 contracts deployed successfully
- ✅ Strategy Registry initialized and accessible
- ✅ Frontend loads real data from blockchain
- ✅ Vault creation works with real transactions
- ✅ No mock data remaining in the application

## 🔗 Useful Links

- [Flow Testnet Faucet](https://faucet.flow.com/)
- [Flow CLI Documentation](https://developers.flow.com/tools/flow-cli)
- [Cadence Language Reference](https://developers.flow.com/cadence/language)
- [Flow Testnet Explorer](https://testnet.flowscan.org/)

---

**🎉 Congratulations!** You now have a fully functional DeFi platform with real smart contracts deployed on Flow Testnet!