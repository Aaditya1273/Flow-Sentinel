import SentinelVaultFinal from 0xc13b08053be24e87
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

// ── Fund Yield Reserve — Phase 2 ──
//
// Deposits FLOW tokens directly into the protocol yield reserve.
// Anyone can fund the reserve — protocol team, DAO treasury, or external sponsors.
// The reserve is used to pay out real yield to vault users after strategy execution.
//
// Reserve health thresholds:
//   < 10 FLOW  → CRITICAL  (users cannot claim yield)
//   < 100 FLOW → WARNING   (reserve will deplete soon)
//   >= 100 FLOW → HEALTHY  (normal operation)
//
// Note: protocol also auto-collects 0.1% fee on every deposit into the reserve.
// This transaction is for bootstrapping and top-ups only.
//
transaction(amount: UFix64) {
    let flowVault: @{FungibleToken.Vault}
    let senderAddress: Address

    prepare(signer: auth(FungibleToken.Withdraw, BorrowValue) &Account) {
        pre {
            amount >= 1.0: "Minimum funding amount is 1 FLOW"
            amount <= 100000.0: "Maximum single funding is 100,000 FLOW"
        }

        let vault = signer.storage
            .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("No Flow vault found in signer storage")

        pre {
            vault.balance >= amount: "Insufficient FLOW balance to fund reserve"
        }

        self.flowVault <- vault.withdraw(amount: amount)
        self.senderAddress = signer.address
    }

    execute {
        let reserveBefore = SentinelVaultFinal.getYieldReserveBalance()
        SentinelVaultFinal.fundYieldReserve(from: <-self.flowVault)
        let reserveAfter = SentinelVaultFinal.getYieldReserveBalance()

        // Log reserve health after funding
        let status = reserveAfter < 10.0 ? "CRITICAL" : reserveAfter < 100.0 ? "WARNING" : "HEALTHY"
        // YieldReserveFunded event is emitted inside fundYieldReserve()
        // status is: CRITICAL < 10 FLOW | WARNING < 100 FLOW | HEALTHY >= 100 FLOW
    }
}
