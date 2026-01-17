@echo off
echo 🚀 Deploying Flow Sentinel Strategy Contracts to Testnet...
echo ==================================================

REM Check if Flow CLI is installed
flow version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Flow CLI is not installed. Please install it first:
    echo    https://developers.flow.com/tools/flow-cli/install
    exit /b 1
)

REM Check if we have the private key file
if not exist "testnet-private-key.pem" (
    echo ❌ testnet-private-key.pem not found!
    echo    Please make sure your private key file is in the project root
    exit /b 1
)

echo 📋 Deploying to account: 0x136b642d0aa31ca9
echo.

echo 1️⃣ Deploying SentinelInterfaces...
flow accounts add-contract SentinelInterfaces contracts/SentinelInterfaces.cdc --network testnet --signer testnet-account
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy SentinelInterfaces
    exit /b 1
)
echo ✅ SentinelInterfaces deployed successfully

echo.
echo 2️⃣ Deploying SentinelVault...
flow accounts add-contract SentinelVault contracts/SentinelVault.cdc --network testnet --signer testnet-account
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy SentinelVault
    exit /b 1
)
echo ✅ SentinelVault deployed successfully

echo.
echo 3️⃣ Deploying LiquidStakingStrategy...
flow accounts add-contract LiquidStakingStrategy contracts/strategies/LiquidStakingStrategy.cdc --network testnet --signer testnet-account
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy LiquidStakingStrategy
    exit /b 1
)
echo ✅ LiquidStakingStrategy deployed successfully

echo.
echo 4️⃣ Deploying YieldFarmingStrategy...
flow accounts add-contract YieldFarmingStrategy contracts/strategies/YieldFarmingStrategy.cdc --network testnet --signer testnet-account
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy YieldFarmingStrategy
    exit /b 1
)
echo ✅ YieldFarmingStrategy deployed successfully

echo.
echo 5️⃣ Deploying ArbitrageStrategy...
flow accounts add-contract ArbitrageStrategy contracts/strategies/ArbitrageStrategy.cdc --network testnet --signer testnet-account
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy ArbitrageStrategy
    exit /b 1
)
echo ✅ ArbitrageStrategy deployed successfully

echo.
echo 6️⃣ Deploying StrategyRegistry...
flow accounts add-contract StrategyRegistry contracts/StrategyRegistry.cdc --network testnet --signer testnet-account
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy StrategyRegistry
    exit /b 1
)
echo ✅ StrategyRegistry deployed successfully

echo.
echo 🎉 All contracts deployed successfully!
echo ==================================================
echo.
echo 📝 Next Steps:
echo 1. Initialize the StrategyRegistry by running the init transaction
echo 2. Update your frontend to use the deployed contracts
echo 3. Test the integration
echo.
echo 🔗 Contract Address: 0x136b642d0aa31ca9
echo 🌐 View on Flow Testnet: https://testnet.flowscan.org/account/0x136b642d0aa31ca9

pause