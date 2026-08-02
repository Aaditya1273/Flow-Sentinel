// setup_staking_collection.cdc
// Sets up a FlowStakingCollection for the protocol account (deployer/keeper).
// Must be run once before any delegation can happen.
// After this runs, call delegate_tokens.cdc to commit FLOW to a node.
//
// Signer: protocol account (testnet-account / 0xc13b08053be24e87)

import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7
import FlowIDTableStaking from 0x9eca2b38b18b5dfe
import FlowStakingCollection from 0x95e019a17d0e23d7
import LiquidStakingStrategy from 0xc13b08053be24e87

transaction {

    prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {

        // ── 1. Set up FlowToken receiver if missing ──
        if signer.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver) == nil {
            let vault = signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("No FlowToken vault found in account")
            let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(
                /storage/flowTokenVault
            )
            signer.capabilities.publish(receiverCap, at: /public/flowTokenReceiver)
        }

        // ── 2. Set up FlowToken balance capability if missing ──
        if signer.capabilities.borrow<&{FungibleToken.Balance}>(/public/flowTokenBalance) == nil {
            let balanceCap = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(
                /storage/flowTokenVault
            )
            signer.capabilities.publish(balanceCap, at: /public/flowTokenBalance)
        }

        // ── 3. Set up FlowStakingCollection if missing ──
        if signer.storage.borrow<&FlowStakingCollection.StakingCollection>(
            from: FlowStakingCollection.StakingCollectionStoragePath
        ) == nil {

            // Issue a capability to the unlocked Flow token vault
            let unlockedVault = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                /storage/flowTokenVault
            )

            // Create the staking collection — no locked account for the protocol account
            let stakingCollection <- FlowStakingCollection.createStakingCollection(
                unlockedVault: unlockedVault,
                tokenHolder: nil
            )
            signer.storage.save(<-stakingCollection, to: FlowStakingCollection.StakingCollectionStoragePath)
        }

        // ── 4. Publish the staking collection public capability if missing ──
        if signer.capabilities.borrow<&{FlowStakingCollection.StakingCollectionPublic}>(
            FlowStakingCollection.StakingCollectionPublicPath
        ) == nil {
            let collectionCap = signer.capabilities.storage.issue<&{FlowStakingCollection.StakingCollectionPublic}>(
                FlowStakingCollection.StakingCollectionStoragePath
            )
            signer.capabilities.publish(collectionCap, at: FlowStakingCollection.StakingCollectionPublicPath)
        }
    }

    execute {
        // Notify LiquidStakingStrategy that the staking collection is now set up
        LiquidStakingStrategy.markStakingCollectionSetup()
        log("FlowStakingCollection set up successfully for protocol account")
    }
}
