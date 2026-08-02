// withdraw_unstaked_tokens.cdc
// Withdraws unstaked FLOW tokens (after the 2-epoch unstaking period) back into
// the protocol account's flowTokenVault so they can be re-delegated or used elsewhere.
//
// Run get_delegator_info.cdc first to check tokensUnstaked > 0 before calling this.
//
// Args:
//   nodeID      — the node ID
//   delegatorID — the delegator ID
//   amount      — FLOW to withdraw (must be ≤ tokensUnstaked)
//
// Signer: protocol keeper account (0xc13b08053be24e87)

import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import FlowIDTableStaking from 0x9eca2b38b18b5dfe
import FlowStakingCollection from 0x95e019a17d0e23d7

transaction(nodeID: String, delegatorID: UInt32, amount: UFix64) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(signer: auth(BorrowValue) &Account) {
        self.stakingCollectionRef = signer.storage.borrow<
            auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
        >(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("FlowStakingCollection not found")
    }

    execute {
        // Withdraw unstaked tokens back to the account's flowTokenVault
        self.stakingCollectionRef.withdrawUnstakedTokens(
            nodeID: nodeID,
            delegatorID: delegatorID,
            amount: amount
        )

        log("✅ Withdrew ".concat(amount.toString())
            .concat(" unstaked FLOW from node ")
            .concat(nodeID)
            .concat(" back to account vault"))
    }
}
