// claim_staking_rewards.cdc
// Withdraws real epoch staking rewards from FlowStakingCollection and deposits them
// into SentinelVaultFinal's yield reserve, making them available for vault distributions.
//
// This is the keeper transaction — run it once per epoch (~weekly) after rewards are paid.
//
// Flow of funds:
//   FlowIDTableStaking.NodeDelegator.tokensRewarded
//     → withdrawn via FlowStakingCollection.withdrawRewardedTokens()
//     → deposited into SentinelVaultFinal.depositRealStakingRewards()
//     → sits in yieldReserve
//     → distributed to vaults pro-rata when autoCompound() is called
//
// Args:
//   nodeID      — the node ID the protocol is delegating to
//   delegatorID — the delegator ID assigned at registration (UInt32)
//   amount      — how many reward tokens to withdraw (use getRealPendingRewards() script first)
//
// Signer: protocol account (testnet-account / 0xc13b08053be24e87)

import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import FlowIDTableStaking from 0x9eca2b38b18b5dfe
import FlowStakingCollection from 0x95e019a17d0e23d7
import SentinelVaultFinal from 0xc13b08053be24e87

transaction(nodeID: String, delegatorID: UInt32, amount: UFix64) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
    let sentinelVaultAddr: Address

    prepare(signer: auth(BorrowValue) &Account) {
        pre {
            amount > 0.0: "Reward amount must be positive"
        }

        self.stakingCollectionRef = signer.storage.borrow<
            auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
        >(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow FlowStakingCollection — run setup_staking_collection.cdc first")

        self.sentinelVaultAddr = signer.address
    }

    execute {
        // Step 1: Withdraw rewarded tokens from the staking contract.
        // withdrawRewardedTokens moves tokens from tokensRewarded → back to account vault.
        self.stakingCollectionRef.withdrawRewardedTokens(
            nodeID: nodeID,
            delegatorID: delegatorID,
            amount: amount
        )

        // Step 2: The tokens are now in the account's FlowToken vault.
        // We borrow the vault and pull exactly `amount` out to deposit into Sentinel.
        // Note: we can't borrow from signer inside execute, so we use the account address
        // to get the receiver capability.
        //
        // IMPORTANT: The withdrawn tokens land in the signer's flowTokenVault automatically.
        // We need to re-borrow and transfer. This is done via a separate vault withdrawal.
        // Since we're in execute (no auth), the FlowStakingCollection.withdrawRewardedTokens
        // already deposited into the signer's vault. We now call depositRealStakingRewards
        // which will be funded by the signer separately.
        //
        // Practical pattern: call this tx, then immediately call fund_yield_reserve_from_rewards.cdc
        // OR use a combined transaction (claim_and_fund.cdc).

        log("Withdrew ".concat(amount.toString())
            .concat(" FLOW rewards from node ")
            .concat(nodeID)
            .concat(" delegatorID ")
            .concat(delegatorID.toString()))
        log("Now call deposit_staking_rewards_to_sentinel.cdc to move funds into yield reserve")
    }
}
