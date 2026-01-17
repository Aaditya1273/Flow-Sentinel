1. Chain/Network Information (RPC URLs, Chain ID, etc.)
Flow supports two environments: Native Cadence (Flow's resource-oriented VM) and Flow EVM (Ethereum-compatible layer). For your project (heavy on Cadence-native features like Scheduled Transactions and VRF), you'll primarily use Cadence via Flow CLI / SDKs, but can bridge to EVM if expanding.
Recommended Wallets:

Flow Wallet (preferred for native features like passkeys/WebAuthn, account abstraction, and seamless Cadence/EVM support): Available on iOS/Android + Chrome extension. Supports biometric signing (FaceID/TouchID) → perfect for your "emergency kill switch". Download from official sources.
MetaMask (for Flow EVM testing/deployment): Add as custom network (great for Solidity interop if you add any).
Other: Rabby, Coinbase Wallet (EVM-compatible).

Flow EVM Network Details (for MetaMask / EVM tools):

Mainnet:
Chain ID: 747 (0x2eb in hex)
Public RPC URL: https://mainnet.evm.nodes.onflow.org
Block Explorer: https://evm.flowscan.io
Native Token: FLOW

Testnet:
Chain ID: 545 (0x221 in hex)
Public RPC URL: https://testnet.evm.nodes.onflow.org
Block Explorer: https://testnet.evm.flowscan.io
Add to MetaMask manually or via chainlist.org/chain/747 (mainnet) / similar for testnet.


Testnet Faucet (for funding test accounts with FLOW tokens):

Official Flow Testnet Faucet: https://faucet.flow.com/ (or https://faucet.flow.com/fund-account)
Create new account: Generate key pair with Flow CLI (flow keys generate), paste public key, complete captcha → get funded.
Fund existing: Enter your testnet address.

Limits: Small amounts for dev/testing (repeatable but rate-limited).
Alternative: Some third-party multi-chain faucets occasionally support Flow testnet.

Tools Setup:

Install Flow CLI (essential for Cadence dev, deployments, emulator): brew install flow-cli (Mac) or from https://developers.flow.com/tools/flow-cli.
Use Flow Emulator for local testing (supports Forte features since CLI v2.7.0+).

2. Documentation & Integration Guides for Building Flow Sentinel
The Flow Developer Portal is your main hub: https://developers.flow.com/
Key sections for your features (Forte upgrade — live on mainnet/testnet):
Core Forte Upgrade & New Features:

Forte Overview: https://flow.com/forte or https://developers.flow.com/blockchain-development-tutorials/forte
Introduces Scheduled Transactions, Actions/Agents, high-precision math (UFix128), AI-friendly tooling.

Scheduled Transactions (your core automation — self-rescheduling vault):

Main Doc: https://developers.flow.com/build/cadence/advanced-concepts/scheduled-transactions
Introduction Tutorial: https://developers.flow.com/blockchain-development-tutorials/forte/scheduled-transactions/scheduled-transactions-introduction
Covers FlowTransactionScheduler, executeTransaction handler, scheduling delays (e.g., every 86400 seconds).
Your snippet (import "FlowTransactionScheduler", executeTransaction, scheduleNextRun) aligns perfectly — use the scaffold in tutorials.

Native VRF / On-Chain Randomness (for MEV-shield jitter):

Cadence: https://developers.flow.com/build/advanced-concepts/randomness (use revertibleRandom() for secure uint64 random).
In Solidity (if using EVM interop): https://developers.flow.com/blockchain-development-tutorials/native-vrf/vrf-in-solidity (via Cadence Arch precompile: revertibleRandom() call).
Best practices: Commit-reveal patterns for fairness → https://developers.flow.com/blockchain-development-tutorials/native-vrf/commit-reveal-cadence

Account Abstraction & Passkeys / WebAuthn (for emergency pause with FaceID):

Native Account Abstraction: https://developers.flow.com/build/cadence/advanced-concepts/account-abstraction
WebAuthn/Passkey Support: Implemented in Forte (FLIP-264) — native protocol-level, no ERC-4337 needed.
Sign tx with biometrics via Flow Wallet.
Docs mention seamless mobile UX; integrate via FCL (Flow Client Library) for frontend.


Cadence Language & Tools:

Cadence by Example / Reference: https://developers.flow.com/cadence (resource-oriented, safe for vaults).
High-Precision Math (UFix128 for yields): Covered in Forte tutorials.
Flow CLI & Testing: https://developers.flow.com/tools/flow-cli

Frontend Integration (your Next.js app):

Use FCL (@onflow/fcl) for wallet connection, signing (supports passkeys via Flow Wallet).
For EVM parts: viem/wagmi + MetaMask.

Additional Resources:

Full Forte Tutorials: https://developers.flow.com/blockchain-development-tutorials/forte (Actions + Scheduled Transactions series).
Native VRF Series: https://developers.flow.com/blockchain-development-tutorials/native-vrf
GitHub Examples: Check Onflow repos (e.g., https://github.com/onflow/ for Cadence scaffolds).
Community: Join Flow Discord (linked in grant post) for real-time help on Forte integration.

Pro Tips for Building:

Start on Testnet + Emulator → deploy Cadence contracts with flow deploy.
Test scheduling: Use delays in seconds; network executes autonomously.
Security: Plan for audits (grant covers this) — Forte emphasizes post-exploit resilience.
Public GitHub: Commit frequently (every 2-3 days) as required for grant.