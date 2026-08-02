// claim_and_deposit_rewards.cdc  ← PRIMARY KEEPER TRANSACTION
//
// Atomically:
//   1. Withdraws epoch staking rewards from FlowStakingCollection (real FLOW)
//   2. Deposits them into SentinelVaultFinal.yieldReserve
//   3. Notifies LiquidStakingStrategy to update APY tracking + pendingRewardsInReserve
//
// Run this once per epoch (~weekly) after FlowIDTableStaking pays out rewards.
// Check claimable amount first with get_staking_rewards.cdc script.
//
// Args:
//   nodeID      — the node ID the protocol is delegating to
//   delegatorID — assigned delegator ID (UInt32, from get_delegator_info.cdc script)
//   amount      — FLOW rewards to withdraw (must be ≤ tokensRewarded)
//
// Signer: protocol keeper account (0xc13b08053be24e87)

import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import FlowIDTableStaking from 0x9eca2b38b18b5dfe
import FlowStakingCollection from 0x95e019a17d0e23d7
import SentinelVaultFinal from 0xc13b08053be24e87

transaction(nodeID: String, delegatorID: UInt32, amount: UFix64) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
    let flowVaultRef: auth(FungibleToken.Withdraw) &FlowToken.Vault
    let flowReceiverRef: &{FungibleToken.Receiver}

    prepare(signer: auth(BorrowValue, FungibleToken.Withdraw) &Account) {
        pre {
            amount > 0.0: "Reward amount must be positive"
            nodeID.length > 0: "Node ID required"
        }

        self.stakingCollectionRef = signer.storage.borrow<
            auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
        >(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("FlowStakingCollection not found — run setup_staking_collection.cdc first")

        self.flowVaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("FlowToken vault not found")

        // We need a receiver back to the signer's vault in case we need to return any dust
        self.flowReceiverRef = signer.capabilities.borrow<&{FungibleToken.Receiver}>(
            /public/flowTokenReceiver
        ) ?? panic("FlowToken receiver not found")
    }

    execute {
        // ── Step 1: Withdraw real epoch rewards from FlowIDTableStaking ──
        // tokensRewarded → signer's flowTokenVault (FlowStakingCollection handles this)
        self.stakingCollectionRef.withdrawRewardedTokens(
            nodeID: nodeID,
            delegatorID: delegatorID,
            amount: amount
        )

        // ── Step 2: Pull the withdrawn FLOW out of the signer's vault ──
        let rewardVault <- self.flowVaultRef.withdraw(amount: amount)

        // ── Step 3: Deposit into SentinelVaultFinal yield reserve + update LiquidStakingStrategy ──
        SentinelVaultFinal.depositRealStakingRewards(from: <-rewardVault, nodeID: nodeID)

        log("✅ Claimed and deposited ".concat(amount.toString())
            .concat(" FLOW staking rewards into Sentinel yield reserve"))
        log("   Node: ".concat(nodeID))
        log("   DelegatorID: ".concat(delegatorID.toString()))
    }
}
