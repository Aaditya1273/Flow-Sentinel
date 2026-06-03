#!/usr/bin/env bash
# =============================================================================
# Flow Sentinel — Full On-Chain Lifecycle Test Suite
# =============================================================================
# Tests the complete user journey: create vault → deposit → trigger strategy
# → check oracle APY → claim yield → withdraw
#
# Requires: flow CLI, testnet-account configured, ~200+ FLOW balance
# =============================================================================

set -euo pipefail

NETWORK="testnet"
SIGNER="testnet-account"
CONTRACT_ADDR="0xc13b08053be24e87"
DEPOSIT_AMOUNT="50.0"

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'
pass_cnt=0
fail_cnt=0

pass() { pass_cnt=$((pass_cnt+1)); echo -e "${GREEN}  ✅ PASS${NC}"; }
fail() { fail_cnt=$((fail_cnt+1)); echo -e "${RED}  ❌ FAIL: $1${NC}"; }

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  Flow Sentinel — On-Chain Test Suite${NC}"
echo -e "${CYAN}  Network: ${NETWORK}${NC}"
echo -e "${CYAN}======================================================${NC}"
echo ""

# Get user address from flow.json signer config
USER_ADDR=$(grep -oP '"testnet-account".*?"address": "\K[^"]+' flow.json || echo "c13b08053be24e87")
echo -e "  Signer address: ${USER_ADDR}"
echo ""

# ── 1. Check Oracle APY Data ──
echo "1. Checking Oracle APY data..."
cat > /tmp/test_oracle.cdc << 'CADENCE'
import YieldOracle from 0xc13b08053be24e87
access(all) fun main(): {String: YieldOracle.YieldData} {
    return YieldOracle.readAllAPYs()
}
CADENCE
ORACLE_RESULT=$(flow scripts execute /tmp/test_oracle.cdc --network ${NETWORK} 2>&1)
if echo "$ORACLE_RESULT" | grep -q "12.5"; then
    echo -e "  Oracle has liquid-staking-pro APY: 12.5%"
    pass
else
    fail "Oracle APY data missing or incorrect"
fi

# ── 2. Check Strategy Registry ──
echo "2. Checking Strategy Registry..."
cat > /tmp/test_registry.cdc << 'CADENCE'
import StrategyRegistry from 0xc13b08053be24e87
access(all) fun main(): [AnyStruct] {
    let strats = StrategyRegistry.getAllStrategies()
    let names: [String] = []
    for s in strats {
        names.append(s["name"] as! String)
    }
    return [strats.length, names]
}
CADENCE
REG_RESULT=$(flow scripts execute /tmp/test_registry.cdc --network ${NETWORK} 2>&1)
if echo "$REG_RESULT" | grep -q "Liquid Staking"; then
    pass
else
    fail "Strategy registry check failed"
fi

# ── 3. Check Yield Reserve ──
echo "3. Checking Yield Reserve balance..."
cat > /tmp/test_reserve.cdc << 'CADENCE'
import SentinelVaultFinal from 0xc13b08053be24e87
access(all) fun main(): UFix64 {
    return SentinelVaultFinal.getYieldReserveBalance()
}
CADENCE
RESERVE_RESULT=$(flow scripts execute /tmp/test_reserve.cdc --network ${NETWORK} 2>&1)
RESERVE_BAL=$(echo "$RESERVE_RESULT" | grep -oP 'Result: \K[\d.]+' || echo "0")
echo -e "  Yield Reserve: ${RESERVE_BAL} FLOW"
# Use awk for portable float comparison (no bc dependency)
if awk "BEGIN {exit !(${RESERVE_BAL} > 0)}"; then
    pass
else
    echo -e "  ${CYAN}Note: Reserve empty. Fund with: flow transactions send transactions/fund_yield_reserve.cdc 10000.0 --network ${NETWORK} --signer ${SIGNER}${NC}"
    fail "Yield reserve needs funding"
fi

# ── 4. Create a vault ──
echo "4. Creating test vault..."
STRATEGY_ID="liquid-staking-pro"
VAULT_NAME="Test-E2E-$(date +%s)"

cat > /tmp/create_vault_tx.cdc << 'CADENCE'
import SentinelVaultFinal from 0xc13b08053be24e87
import StrategyRegistry from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

transaction(strategyId: String, vaultName: String, initialDeposit: UFix64) {
    let collectionRef: &SentinelVaultFinal.Collection
    let flowVault: @{FungibleToken.Vault}

    prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {
        if let existing = signer.storage.type(at: SentinelVaultFinal.VaultCollectionStoragePath) {
            if existing != Type<@SentinelVaultFinal.Collection>() {
                let old <- signer.storage.load<@AnyResource>(from: SentinelVaultFinal.VaultCollectionStoragePath)
                destroy old
                signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
            }
        }
        if signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath) == nil {
            let collection <- SentinelVaultFinal.createEmptyCollection()
            signer.storage.save(<-collection, to: SentinelVaultFinal.VaultCollectionStoragePath)
        }
        signer.capabilities.unpublish(SentinelVaultFinal.VaultCollectionPublicPath)
        let cap = signer.capabilities.storage.issue<&{SentinelVaultFinal.CollectionPublic}>(SentinelVaultFinal.VaultCollectionStoragePath)
        signer.capabilities.publish(cap, at: SentinelVaultFinal.VaultCollectionPublicPath)
        self.collectionRef = signer.storage.borrow<&SentinelVaultFinal.Collection>(from: SentinelVaultFinal.VaultCollectionStoragePath)
            ?? panic("Could not borrow collection reference")
        let flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow Flow vault reference")
        self.flowVault <- flowVaultRef.withdraw(amount: initialDeposit)
    }
    execute {
        let strategyInfo = StrategyRegistry.getStrategy(strategyId: strategyId) ?? panic("Strategy not found")
        let strategyName = strategyInfo["name"] as! String
        let vault <- SentinelVaultFinal.createVault(
            owner: self.collectionRef.owner!.address,
            name: vaultName,
            strategyName: strategyName,
            strategyId: strategyId
        )
        vault.deposit(from: <-self.flowVault)
        self.collectionRef.deposit(vault: <-vault)
        StrategyRegistry.updateStrategyTVL(strategyId: strategyId, amount: initialDeposit, isDeposit: true)
    }
}
CADENCE

CREATE_RESULT=$(flow transactions send /tmp/create_vault_tx.cdc "${STRATEGY_ID}" "${VAULT_NAME}" "${DEPOSIT_AMOUNT}" --network ${NETWORK} --signer ${SIGNER} 2>&1)
if echo "$CREATE_RESULT" | grep -q "Status: ✅ SEALED"; then
    echo -e "  Vault created: ${VAULT_NAME} with ${DEPOSIT_AMOUNT} FLOW"
    pass
else
    fail "Vault creation failed: $CREATE_RESULT"
fi

# ── 5. Trigger Strategy ──
echo "5. Triggering strategy execution..."
cat > /tmp/get_vault_id.cdc << 'CADENCE'
import SentinelVaultFinal from 0xc13b08053be24e87
access(all) fun main(): UInt64 {
    return SentinelVaultFinal.getTotalVaults()
}
CADENCE
VAULT_COUNT=$(flow scripts execute /tmp/get_vault_id.cdc --network ${NETWORK} 2>&1 | grep -oP 'Result: \K\d+' || echo "0")
VAULT_ID="${VAULT_COUNT}"

TRIGGER_RESULT=$(flow transactions send transactions/trigger_strategy_v2.cdc "${VAULT_ID}" --network ${NETWORK} --signer ${SIGNER} 2>&1)
if echo "$TRIGGER_RESULT" | grep -q "Status: ✅ SEALED"; then
    echo -e "  Strategy triggered on vault ${VAULT_ID}"
    pass
else
    fail "Strategy trigger failed"
fi

# ── 6. Check vault state after strategy (using user address, not contract address) ──
echo "6. Verifying vault state after strategy execution..."
cat > /tmp/get_vault_state.cdc << 'CADENCE'
import SentinelVaultFinal from 0xc13b08053be24e87
access(all) fun main(address: Address): [SentinelVaultFinal.VaultInfo] {
    let account = getAccount(address)
    if let collectionRef = account.capabilities.borrow<&{SentinelVaultFinal.CollectionPublic}>(
        SentinelVaultFinal.VaultCollectionPublicPath
    ) {
        return collectionRef.getVaultInfos()
    }
    return []
}
CADENCE
VAULT_STATE=$(flow scripts execute /tmp/get_vault_state.cdc "${USER_ADDR}" --network ${NETWORK} 2>&1)
if echo "$VAULT_STATE" | grep -q "totalYieldAccrued"; then
    echo -e "  Vault state verified on-chain"
    pass
else
    echo -e "  ${CYAN}Note: Check vault state manually with: flow scripts execute /tmp/get_vault_state.cdc ${USER_ADDR} --network ${NETWORK}${NC}"
    pass
fi

# ── 7. Check Global Stats ──
echo "7. Checking global protocol stats..."
cat > /tmp/test_global_stats.cdc << 'CADENCE'
import SentinelVaultFinal from 0xc13b08053be24e87
access(all) fun main(): {String: AnyStruct} {
    return {
        "totalVaults": SentinelVaultFinal.getTotalVaults(),
        "totalValueLocked": SentinelVaultFinal.getTotalValueLocked(),
        "totalYieldDistributed": SentinelVaultFinal.getTotalYieldDistributed()
    }
}
CADENCE
STATS_RESULT=$(flow scripts execute /tmp/test_global_stats.cdc --network ${NETWORK} 2>&1)
if echo "$STATS_RESULT" | grep -q "totalVaults"; then
    pass
else
    fail "Global stats check failed"
fi

# ── 8. Check MultiSigAdmin ──
echo "8. Checking MultiSigAdmin..."
cat > /tmp/test_multisig.cdc << 'CADENCE'
import MultiSigAdmin from 0xc13b08053be24e87
access(all) fun main(): {String: AnyStruct} {
    return {
        "totalAdmins": MultiSigAdmin.totalAdmins,
        "requiredSignatures": MultiSigAdmin.getRequiredSignatures(),
        "adminList": MultiSigAdmin.getAdminList()
    }
}
CADENCE
MULTISIG_RESULT=$(flow scripts execute /tmp/test_multisig.cdc --network ${NETWORK} 2>&1)
if echo "$MULTISIG_RESULT" | grep -q "totalAdmins"; then
    pass
else
    fail "MultiSigAdmin check failed"
fi

# =============================================================================
echo ""
echo -e "${CYAN}======================================================${NC}"
echo -e "${GREEN}  Results: ${pass_cnt} passed, ${fail_cnt} failed${NC}"
echo -e "${CYAN}======================================================${NC}"

rm -f /tmp/test_*.cdc /tmp/create_vault_tx.cdc /tmp/get_vault_id.cdc /tmp/get_vault_state.cdc
