import SentinelVaultFinal from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

transaction(amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}

    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow Flow vault reference")

        self.flowVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        SentinelVaultFinal.fundYieldReserve(from: <-self.flowVault)
    }
}
