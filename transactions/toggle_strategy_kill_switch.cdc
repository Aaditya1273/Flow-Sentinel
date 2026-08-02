import LiquidStakingStrategy from 0x60320435dd7725c1
import YieldFarmingStrategy from 0x60320435dd7725c1
import StrategyRegistry from 0x60320435dd7725c1

// ── Toggle Strategy Kill Switch — Phase 9 ──
// Disables or enables an individual strategy contract.
// Only callable by the contract deployer account (access(account)).
//
// When a strategy is killed:
//   - New vaults cannot be created with this strategy
//   - Existing vaults cannot execute this strategy
//   - Existing vaults can still withdraw funds
//
// Usage:
//   flow transactions send ./transactions/toggle_strategy_kill_switch.cdc \
//     "liquid-staking-pro" false \
//     --network testnet --signer sentinelfinal-account
//
//   flow transactions send ./transactions/toggle_strategy_kill_switch.cdc \
//     "liquid-staking-pro" true \
//     --network testnet --signer sentinelfinal-account

transaction(strategyId: String, active: Bool) {
    prepare(signer: auth(BorrowValue) &Account) {
        if strategyId == "liquid-staking-pro" {
            LiquidStakingStrategy.setActive(active)
        } else if strategyId == "defi-yield-maximizer" || strategyId == "high-yield-farming" {
            YieldFarmingStrategy.setActive(active)
        } else {
            panic("Unknown strategyId: ".concat(strategyId))
        }
        emit StrategyRegistry.StrategyUpdated(id: strategyId, updatedField: active ? "kill-switch-resume" : "kill-switch-activate")
    }
}
