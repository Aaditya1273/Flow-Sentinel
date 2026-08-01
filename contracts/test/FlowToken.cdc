import FungibleToken from 0xee82856bf20e2aa6

access(all) contract FlowToken {
    access(all) var totalSupply: UFix64

    access(all) resource Vault: FungibleToken.Balance, FungibleToken.Provider, FungibleToken.Receiver {
        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(all) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            self.balance = self.balance - amount
            let vault <- create Vault(balance: amount)
            return <- vault
        }

        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            self.balance = self.balance + from.balance
            destroy from
        }
    }

    access(all) fun createEmptyVault(vaultType: Type): @{FungibleToken.Vault} {
        return <- create Vault(balance: 0.0)
    }

    access(all) fun getTotalSupply(): UFix64 {
        return self.totalSupply
    }

    init() {
        self.totalSupply = 1000000000.0
        let vault <- create Vault(balance: 1000000000.0)
        self.account.storage.save(<- vault, to: /storage/flowTokenVault)
    }
}
