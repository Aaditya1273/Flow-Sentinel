import SentinelVaultFinal from 0xc13b08053be24e87
import MultiSigAdmin from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

// Fund the yield reserve with FLOW tokens
// Only MultiSig admins can fund the yield reserve
transaction(amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}

    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        // Authorization: Only MultiSig admins can fund the yield reserve
        if !MultiSigAdmin.isAdmin(signer.address) {
            panic("Only MultiSig admins can fund the yield reserve")
        }

        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow Flow vault reference")

        self.flowVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        SentinelVaultFinal.fundYieldReserve(from: <-self.flowVault)
    }
}
