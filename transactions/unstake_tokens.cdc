// unstake_tokens.cdc
// Requests unstaking of delegated FLOW tokens from a Flow node.
//
// IMPORTANT: Flow unstaking is a 2-epoch process:
//   Epoch N:   request submitted → tokens in "tokensRequestedToUnstake"
//   Epoch N+1: tokens move to "tokensUnstaking" (locked, cannot withdraw)
//   Epoch N+2: tokens move to "tokensUnstaked" → can be withdrawn
//
// This means there is approximately a 2-week delay before tokens are withdrawable.
// Use withdraw_unstaked_tokens.cdc after the waiting period.
//
// Args:
//   nodeID      — the node ID currently being delegated to
//   delegatorID — the delegator ID assigned at registration
//   amount      — FLOW amount to unstake
//
// Signer: protocol keeper account (0xc13b08053be24e87)

import FlowIDTableStaking from 0x9eca2b38b18b5dfe
import FlowStakingCollection from 0x95e019a17d0e23d7
import LiquidStakingStrategy from 0xc13b08053be24e87

transaction(nodeID: String, delegatorID: UInt32, amount: UFix64) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(signer: auth(BorrowValue) &Account) {
        pre {
            amount > 0.0: "Unstake amount must be positive"
        }

        self.stakingCollectionRef = signer.storage.borrow<
            auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
        >(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("FlowStakingCollection not found")
    }

    execute {
        // Request unstaking — tokens will be available after ~2 epochs (~2 weeks)
        self.stakingCollectionRef.requestUnstaking(
            nodeID: nodeID,
            delegatorID: delegatorID,
            amount: amount
        )

        log("⚠️  Unstake requested: ".concat(amount.toString())
            .concat(" FLOW from node ")
            .concat(nodeID))
        log("   Tokens will be available to withdraw after ~2 epochs (~2 weeks)")
        log("   Run withdraw_unstaked_tokens.cdc after the waiting period")
    }
}
