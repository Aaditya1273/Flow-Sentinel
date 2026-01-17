# 🛡️ Flow Sentinel

**The World's First Autonomous, MEV-Resistant Wealth Manager**

Built for the Flow Foundation Grant - showcasing cutting-edge Forte upgrade features.

## 🚀 Grant-Winning Features

- **Forte Scheduled Transactions**: Self-executing vault that rebalances every 24 hours
- **Native VRF**: On-chain randomness prevents MEV front-running attacks  
- **Passkey Integration**: Emergency pause via biometric authentication
- **Account Abstraction**: Seamless user experience without seed phrases
- **High Precision**: UFix64 calculations for accurate DeFi operations

## ⚡ Quick Start

### 1. Smart Contracts
```bash
# Start Flow emulator
flow emulator

# Deploy contracts
flow project deploy --network emulator

# Initialize vault
flow transactions send ./transactions/init_sentinel.cdc --network emulator

# Check status
flow scripts execute ./scripts/get_vault_info.cdc --arg Address:0xf8d6e0586b0a20c7 --network emulator
```

### 2. Web Interface
```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:3000` and connect your Flow wallet.

## 🏗️ Architecture

```
flow-sentinel/
├── contracts/           # Cadence smart contracts
│   ├── SentinelVault.cdc      # Core autonomous vault
│   └── SentinelInterfaces.cdc # Standard interfaces
├── transactions/        # Cadence transactions
├── scripts/            # Query scripts
├── app/               # Next.js frontend
└── tests/             # Test suite
```

## 🎯 Core Innovation

**Autonomous Operation**: Unlike Ethereum/Solana that rely on external bots, Flow Sentinel uses Flow's native scheduler to execute trades automatically. The vault literally schedules its own next execution - creating an infinite loop of autonomous wealth management.

**MEV Protection**: Native VRF adds randomness to trade timing, making front-running significantly harder than traditional AMM interactions.

**Emergency Controls**: Passkey integration allows instant pause via FaceID/TouchID - no seed phrases needed.

## 💰 Grant Alignment

This project directly addresses Flow Foundation's priorities:

- **Technology**: Showcases Forte upgrade capabilities
- **Innovation**: First truly autonomous DeFi vault
- **Adoption**: Consumer-friendly Passkey integration  
- **Ecosystem**: Increases TVL through automated safety vaults

## 🔧 Development Status

- ✅ Core smart contracts implemented
- ✅ Autonomous scheduling integrated
- ✅ MEV protection via native VRF
- ✅ Emergency pause mechanism
- ✅ Web interface with wallet connection
- ✅ Grant documentation complete

## 📋 Next Steps

1. Security audit and testing
2. DeFi protocol integrations (IncrementFi, Flowty)
3. Advanced yield strategies
4. Mobile app with Passkey support
5. Community SDK development

---

**Built with Flow's Forte upgrade - The future of autonomous DeFi**