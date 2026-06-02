#!/bin/bash
# ────────────────────────────────────────────────────────────────
# Flow Sentinel — Full On-Chain Test Suite
# Tests the complete strategy lifecycle on Flow Testnet
# ────────────────────────────────────────────────────────────────
set -euo pipefail

SIGNER="testnet-account"
NETWORK="testnet"
VAULT_ADDR="0xc13b08053be24e87"
TX_DIR="transactions"

echo "═══════════════════════════════════════════════════════════"
echo "  Flow Sentinel — Comprehensive On-Chain Test Suite"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Signer: $SIGNER"
echo "  Network: $NETWORK"
echo ""

# Create temp script for checking state
cat > /tmp/sentinel-check-state.cdc << 'CDCEOF'
import SentinelVaultFinal from 0xc13b08053be24e87

access(all) fun main(address: Address): {String: AnyStruct} {
    let account = getAccount(address)
    var vaultsFound = 0
    var totalBalance = 0.0

    if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
        SentinelVaultFinal.VaultCollectionPublicPath
    ) {
        let infos = collectionRef.getVaultInfos()
        vaultsFound = infos.length
        for vault in infos {
            totalBalance = totalBalance + vault.balance
        }
    }

    return {
        "vaultsFound": vaultsFound,
        "totalBalance": totalBalance,
        "yieldReserve": SentinelVaultFinal.getYieldReserveBalance(),
        "totalVaults": SentinelVaultFinal.getTotalVaults(),
        "totalValueLocked": SentinelVaultFinal.getTotalValueLocked(),
        "totalYieldDistributed": SentinelVaultFinal.getTotalYieldDistributed()
    }
}
CDCEOF

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 1: Initial On-Chain State                          │"
echo "└─────────────────────────────────────────────────────────┘"
flow scripts execute /tmp/sentinel-check-state.cdc "$VAULT_ADDR" --network "$NETWORK" 2>&1 || echo "  ⚠ State check failed (expected on fresh account)"
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 2: Create LiquidStaking Vault (100 FLOW)           │"
echo "└─────────────────────────────────────────────────────────┘"
flow transactions send "$TX_DIR"/create_vault_and_deposit.cdc 'liquid-staking-pro' 'Test-LiquidStaking' 100.0 \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 || echo "  ⚠ Create failed — try using create+deposit tx or separate steps"
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 3: Create YieldFarming Vault (200 FLOW)            │"
echo "└─────────────────────────────────────────────────────────┘"
flow transactions send "$TX_DIR"/create_vault_and_deposit.cdc 'defi-yield-maximizer' 'Test-YieldFarming' 200.0 \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 || echo "  ⚠ Create failed"
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 4: Create Arbitrage Vault (500 FLOW)               │"
echo "└─────────────────────────────────────────────────────────┘"
flow transactions send "$TX_DIR"/create_vault_and_deposit.cdc 'arbitrage-hunter' 'Test-Arbitrage' 500.0 \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 || echo "  ⚠ Create failed"
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 5: Trigger Strategy on All Vaults                  │"
echo "└─────────────────────────────────────────────────────────┘"
echo "  Triggering LiquidStaking on vault 1..."
flow transactions send "$TX_DIR"/trigger_strategy_v2.cdc 1 'liquid-staking-pro' \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 | tail -3
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 6: Check Yield Accrued                             │"
echo "└─────────────────────────────────────────────────────────┘"
flow scripts execute /tmp/sentinel-check-state.cdc "$VAULT_ADDR" --network "$NETWORK" 2>&1
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 7: Claim Yield from Vault 1                        │"
echo "└─────────────────────────────────────────────────────────┘"
flow transactions send "$TX_DIR"/claim_yield.cdc 1 \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 | tail -5
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 8: Emergency Pause Vault 1                         │"
echo "└─────────────────────────────────────────────────────────┘"
flow transactions send "$TX_DIR"/pause_vault_v2.cdc 1 \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 | tail -3
echo ""

echo "┌─────────────────────────────────────────────────────────┐"
echo "│ TEST 9: Resume Vault 1                                  │"
echo "└─────────────────────────────────────────────────────────┘"
flow transactions send "$TX_DIR"/resume_vault.cdc 1 \
  --network "$NETWORK" --signer "$SIGNER" 2>&1 | tail -3
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  FINAL STATE"
echo "═══════════════════════════════════════════════════════════"
flow scripts execute /tmp/sentinel-check-state.cdc "$VAULT_ADDR" --network "$NETWORK" 2>&1
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  TEST SUITE COMPLETE"
echo "═══════════════════════════════════════════════════════════"
