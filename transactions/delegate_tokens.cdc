// delegate_tokens.cdc
// Delegates FLOW tokens from the protocol account to a Flow node via FlowStakingCollection.
// This is the core "put money to work" transaction — real staking starts here.
//
// Prerequisites: setup_staking_collection.cdc must have been run first.
//
// Args:
//   nodeID  — 64-char hex node ID to delegate to
//   amount  — FLOW amount to delegate (minimum 50.0 per Flow protocol rules)
//
// After delegation, tokens are "committed" until the next epoch boundary (~1 week).
// Once the epoch rolls over they become "staked" and start earning rewards.
//
// Signer: protocol account (testnet-account / 0xc13b08053be24e87)

import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import FlowIDTableStaking from 0x9eca2b38b18b5dfe
import FlowStakingCollection from 0x95e019a17d0e23d7
import LiquidStakingStrategy from 0xc13b08053be24e87

transaction(nodeID: String, amount: UFix64) {

    let stakingCollectionRef: auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection

    prepare(signer: auth(BorrowValue) &Account) {
        pre {
            amount >= 50.0: "Minimum delegation is 50 FLOW per Flow protocol rules"
        }

        self.stakingCollectionRef = signer.storage.borrow<
            auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection
        >(from: FlowStakingCollection.StakingCollectionStoragePath)
            ?? panic("Could not borrow FlowStakingCollection — run setup_staking_collection.cdc first")
    }

    execute {
        // Register as a delegator to the specified node.
        // This creates a NodeDelegator resource inside the StakingCollection.
        // The delegator ID is assigned automatically by FlowIDTableStaking.
        self.stakingCollectionRef.registerDelegator(nodeID: nodeID, amount: amount)

        // Retrieve the delegator ID that was assigned
        let delegatorIDs = FlowStakingCollection.getAllDelegatorInfo(
            address: LiquidStakingStrategy.account.address
        )

        var assignedDelegatorID: UInt32? = nil
        for info in delegatorIDs {
            if info.nodeID == nodeID {
                assignedDelegatorID = info.id
                break
            }
        }

        // Notify LiquidStakingStrategy of the delegation
        LiquidStakingStrategy.recordDelegation(amount: amount, delegatorID: assignedDelegatorID)

        log("Delegated ".concat(amount.toString())
            .concat(" FLOW to node ")
            .concat(nodeID)
            .concat(" — delegatorID: ")
            .concat(assignedDelegatorID?.toString() ?? "pending"))
    }
}
