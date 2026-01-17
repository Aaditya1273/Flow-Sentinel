#!/bin/bash

echo "🚀 Deploying Flow Sentinel Strategy Contracts to Testnet..."
echo "=================================================="

# Check if Flow CLI is installed
if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI is not installed. Please install it first:"
    echo "   https://developers.flow.com/tools/flow-cli/install"
    exit 1
fi

# Check if we have the private key file
if [ ! -f "testnet-private-key.pem" ]; then
    echo "❌ testnet-private-key.pem not found!"
    echo "   Please make sure your private key file is in the project root"
    exit 1
fi

echo "📋 Deploying to account: 0x136b642d0aa31ca9"
echo ""

# Deploy contracts in the correct order (dependencies first)
echo "1️⃣ Deploying SentinelInterfaces..."
flow accounts add-contract SentinelInterfaces ./contracts/SentinelInterfaces.cdc --network testnet --signer testnet-account

if [ $? -eq 0 ]; then
    echo "✅ SentinelInterfaces deployed successfully"
else
    echo "❌ Failed to deploy SentinelInterfaces"
    exit 1
fi

echo ""
echo "2️⃣ Deploying SentinelVault..."
flow accounts add-contract SentinelVault ./contracts/SentinelVault.cdc --network testnet --signer testnet-account

if [ $? -eq 0 ]; then
    echo "✅ SentinelVault deployed successfully"
else
    echo "❌ Failed to deploy SentinelVault"
    exit 1
fi

echo ""
echo "3️⃣ Deploying LiquidStakingStrategy..."
flow accounts add-contract LiquidStakingStrategy ./contracts/strategies/LiquidStakingStrategy.cdc --network testnet --signer testnet-account

if [ $? -eq 0 ]; then
    echo "✅ LiquidStakingStrategy deployed successfully"
else
    echo "❌ Failed to deploy LiquidStakingStrategy"
    exit 1
fi

echo ""
echo "4️⃣ Deploying YieldFarmingStrategy..."
flow accounts add-contract YieldFarmingStrategy ./contracts/strategies/YieldFarmingStrategy.cdc --network testnet --signer testnet-account

if [ $? -eq 0 ]; then
    echo "✅ YieldFarmingStrategy deployed successfully"
else
    echo "❌ Failed to deploy YieldFarmingStrategy"
    exit 1
fi

echo ""
echo "5️⃣ Deploying ArbitrageStrategy..."
flow accounts add-contract ArbitrageStrategy ./contracts/strategies/ArbitrageStrategy.cdc --network testnet --signer testnet-account

if [ $? -eq 0 ]; then
    echo "✅ ArbitrageStrategy deployed successfully"
else
    echo "❌ Failed to deploy ArbitrageStrategy"
    exit 1
fi

echo ""
echo "6️⃣ Deploying StrategyRegistry..."
flow accounts add-contract StrategyRegistry ./contracts/StrategyRegistry.cdc --network testnet --signer testnet-account

if [ $? -eq 0 ]; then
    echo "✅ StrategyRegistry deployed successfully"
else
    echo "❌ Failed to deploy StrategyRegistry"
    exit 1
fi

echo ""
echo "🎉 All contracts deployed successfully!"
echo "=================================================="
echo ""
echo "📝 Next Steps:"
echo "1. Initialize the StrategyRegistry by running the init transaction"
echo "2. Update your frontend to use the deployed contracts"
echo "3. Test the integration"
echo ""
echo "🔗 Contract Address: 0x136b642d0aa31ca9"
echo "🌐 View on Flow Testnet: https://testnet.flowscan.org/account/0x136b642d0aa31ca9"