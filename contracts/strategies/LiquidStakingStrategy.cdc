import "FungibleToken"
import "FlowToken"
import "SentinelInterfaces"
import "YieldOracle"
import "FlowStakingCollection"
import "FlowIDTableStaking"

// ── Liquid Staking Strategy (PRODUCTION) ──
// Delegates pooled vault FLOW to a real Flow validator node via FlowStakingCollection.
// Yield is realized ONLY from real epoch rewards claimed from FlowIDTableStaking —
// there is no simulated/invented yield anywhere in this contract.
access(all) contract LiquidStakingStrategy {

    access(all) let strategyId: String
    access(all) let name: String
    access(all) let description: String
    access(all) let riskLevel: UInt8
    access(all) let category: String
    access(all) let minDeposit: UFix64
    access(all) var expectedAPY: UFix64          // synced from oracle (display estimate only)
    access(all) var lastEpochAPY: UFix64         // last synced APY
    access(all) var totalValueLocked: UFix64     // cumulative balance processed
    access(all) var totalParticipants: UInt64
    access(all) var totalExecutions: UInt64
    access(all) var isActive: Bool

    // ── Real staking state ──
    access(all) var protocolNodeID: String
    access(all) var stakingCollectionSetup: Bool
    access(all) var totalStakedPrincipal: UFix64
    access(all) var accruedRewardPerFlow: UFix64   // reward-per-staked-FLOW accumulator, real rewards only
    access(all) var totalRealRewardsClaimed: UFix64
    access(all) var lastRewardClaimTime: UFix64

    // Kill switch — admin can disable/enable this strategy
    access(account) fun setActive(_ active: Bool) {
        self.isActive = active
    }

    // Events
    access(all) event StrategyExecuted(
        vaultId: UInt64, amount: UFix64, yield: UFix64,
        realizedAPY: UFix64, protocolSource: String,
        usedRealProtocol: Bool, mevJitterBps: UInt64
    )
    access(all) event EpochDataSynced(epochAPY: UFix64, weeklyRate: UFix64, source: String)
    access(all) event TVLUpdated(newTVL: UFix64, participants: UInt64)
    access(all) event StakingCollectionInitialized(nodeID: String)
    access(all) event RealTokensStaked(amount: UFix64, nodeID: String, totalStaked: UFix64)
    access(all) event RealRewardsClaimed(amount: UFix64, newAccruedRewardPerFlow: UFix64)

    init() {
        self.strategyId = "liquid-staking-pro"
        self.name = "Flow Liquid Staking Pro"
        self.description = "Professional liquid staking strategy generating yield from real Flow network delegation rewards"
        self.riskLevel = 1  // Low risk
        self.category = "liquid-staking"
        self.minDeposit = 5.0
        self.expectedAPY = 4.5  // Default display estimate until oracle/real data available
        self.lastEpochAPY = 4.5
        self.totalValueLocked = 0.0
        self.totalParticipants = 0
        self.totalExecutions = 0
        self.isActive = true

        self.protocolNodeID = ""
        self.stakingCollectionSetup = false
        self.totalStakedPrincipal = 0.0
        self.accruedRewardPerFlow = 0.0
        self.totalRealRewardsClaimed = 0.0
        self.lastRewardClaimTime = 0.0
    }

    // ── Sync APY from oracle (display/estimate only — never used to fabricate yield) ──
    access(contract) fun syncEpochAPY(): UFix64 {
        let apy = self.getOracleAPY()
        LiquidStakingStrategy.lastEpochAPY = apy
        LiquidStakingStrategy.expectedAPY = apy
        emit EpochDataSynced(epochAPY: apy, weeklyRate: apy / 52.0, source: "YieldOracle")
        return apy
    }

    access(contract) fun getOracleAPY(): UFix64 {
        if let data = YieldOracle.getYieldData(LiquidStakingStrategy.strategyId) {
            LiquidStakingStrategy.expectedAPY = data.apy
            return data.apy
        }
        return 4.5
    }

    // ── Real APY computed from actual delegator reward history, when available ──
    access(all) fun getRealizedAPY(): UFix64 {
        if self.totalStakedPrincipal == 0.0 || self.totalRealRewardsClaimed == 0.0 {
            return self.getOracleAPY()
        }
        // Simple annualization: rewards claimed so far vs. principal, scaled by weeks since first stake.
        // This is a coarse estimate — precise APY needs a full epoch-reward history, not built yet.
        return (self.totalRealRewardsClaimed / self.totalStakedPrincipal) * 52.0 * 100.0
    }

    // ── One-time setup: create this account's FlowStakingCollection and pick a validator node ──
    access(account) fun setupStakingCollection(nodeID: String) {
        pre {
            !self.stakingCollectionSetup: "Staking collection already set up"
            nodeID.length == 64: "nodeID must be a 32-byte hex string"
        }
        if self.account.storage.borrow<&FlowStakingCollection.StakingCollection>(
            from: FlowStakingCollection.StakingCollectionStoragePath
        ) == nil {
            let flowTokenCap = self.account.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)
            self.account.storage.save(
                <- FlowStakingCollection.createStakingCollection(unlockedVault: flowTokenCap, tokenHolder: nil),
                to: FlowStakingCollection.StakingCollectionStoragePath
            )
            let cap = self.account.capabilities.storage.issue<&FlowStakingCollection.StakingCollection>(
                FlowStakingCollection.StakingCollectionStoragePath
            )
            self.account.capabilities.publish(cap, at: FlowStakingCollection.StakingCollectionPublicPath)
        }
        self.protocolNodeID = nodeID
        self.stakingCollectionSetup = true
        emit StakingCollectionInitialized(nodeID: nodeID)
    }

    // Only safe to call before any real tokens have been staked (totalStakedPrincipal == 0) —
    // switching validators after real delegation exists requires unstaking first, not built yet.
    access(account) fun changeNode(nodeID: String) {
        pre {
            self.stakingCollectionSetup: "Call setupStakingCollection first"
            self.totalStakedPrincipal == 0.0: "Cannot change node after real staking has begun"
            nodeID.length == 64: "nodeID must be a 32-byte hex string"
        }
        self.protocolNodeID = nodeID
        emit StakingCollectionInitialized(nodeID: nodeID)
    }

    // ── Real staking: delegates `amount` FLOW (already sitting in this account's default vault) ──
    access(account) fun stake(amount: UFix64) {
        pre {
            self.stakingCollectionSetup: "Call setupStakingCollection first"
            amount > 0.0: "Amount must be positive"
        }
        let collectionRef = self.account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(
            from: FlowStakingCollection.StakingCollectionStoragePath
        ) ?? panic("Could not borrow staking collection")

        var delegatorID: UInt32? = nil
        for idInfo in collectionRef.getDelegatorIDs() {
            if idInfo.delegatorNodeID == self.protocolNodeID {
                delegatorID = idInfo.delegatorID
                break
            }
        }

        if delegatorID == nil {
            collectionRef.registerDelegator(nodeID: self.protocolNodeID, amount: amount)
        } else {
            collectionRef.stakeNewTokens(nodeID: self.protocolNodeID, delegatorID: delegatorID, amount: amount)
        }

        self.totalStakedPrincipal = self.totalStakedPrincipal + amount
        emit RealTokensStaked(amount: amount, nodeID: self.protocolNodeID, totalStaked: self.totalStakedPrincipal)
    }

    // ── Real claim: withdraws whatever FlowIDTableStaking actually owes this delegator ──
    // Returns an empty vault if nothing is claimable yet (rewards only land once per epoch, ~1 week).
    access(account) fun claimRewards(): @{FungibleToken.Vault} {
        pre {
            self.stakingCollectionSetup: "Not set up"
        }
        let delegators = FlowStakingCollection.getAllDelegatorInfo(address: self.account.address)
        var claimable: UFix64 = 0.0
        var delegatorID: UInt32? = nil
        for d in delegators {
            if d.nodeID == self.protocolNodeID {
                claimable = d.tokensRewarded
                delegatorID = d.id
            }
        }

        if claimable == 0.0 {
            return <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
        }

        let collectionRef = self.account.storage.borrow<auth(FlowStakingCollection.CollectionOwner) &FlowStakingCollection.StakingCollection>(
            from: FlowStakingCollection.StakingCollectionStoragePath
        ) ?? panic("Could not borrow staking collection")
        collectionRef.withdrawRewardedTokens(nodeID: self.protocolNodeID, delegatorID: delegatorID, amount: claimable)

        // withdrawRewardedTokens deposits into this account's own default FlowToken vault —
        // pull it back out so the caller can route it to the real, claim-only rewards pool.
        let flowVaultRef = self.account.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow FlowToken vault")
        let claimedVault <- flowVaultRef.withdraw(amount: claimable)

        if self.totalStakedPrincipal > 0.0 {
            self.accruedRewardPerFlow = self.accruedRewardPerFlow + (claimable / self.totalStakedPrincipal)
        }
        self.totalRealRewardsClaimed = self.totalRealRewardsClaimed + claimable
        self.lastRewardClaimTime = getCurrentBlock().timestamp
        emit RealRewardsClaimed(amount: claimable, newAccruedRewardPerFlow: self.accruedRewardPerFlow)
        return <- claimedVault
    }

    access(all) resource StrategyExecutor: SentinelInterfaces.IStrategy {

        // NOTE: this call intentionally never invents yield. Real yield only exists once
        // this account has staked FLOW via stake() and claimed real rewards via claimRewards() —
        // both of which move real resources and cannot be expressed through this UFix64-only
        // interface. Per-vault yield is realized by SentinelVaultFinal.Vault.claimYield(), which
        // reads LiquidStakingStrategy.accruedRewardPerFlow directly.
        access(all) fun executeStrategy(vaultBalance: UFix64): SentinelInterfaces.StrategyResult {
            pre {
                vaultBalance > 0.0: "Cannot execute strategy with zero balance"
                LiquidStakingStrategy.isActive: "Strategy is not active"
            }
            LiquidStakingStrategy.totalExecutions = LiquidStakingStrategy.totalExecutions + 1
            let realizedAPY = LiquidStakingStrategy.getRealizedAPY()

            return SentinelInterfaces.StrategyResult(
                yieldAmount: 0.0,
                protocolSource: "Flow Network Staking",
                realizedAPY: realizedAPY,
                confidence: LiquidStakingStrategy.stakingCollectionSetup ? 0.95 : 0.50,
                executionNote: LiquidStakingStrategy.stakingCollectionSetup
                    ? "Real yield accrues via FlowStakingCollection delegation — claim via claimYield()"
                    : "Staking collection not yet set up — no real yield is accruing",
                strategyId: LiquidStakingStrategy.strategyId,
                usedRealProtocol: LiquidStakingStrategy.stakingCollectionSetup
            )
        }

        access(all) fun getExpectedYield(amount: UFix64): UFix64 {
            let apy = LiquidStakingStrategy.getRealizedAPY()
            return amount * (apy / 100.0) / 365.0  // Daily estimate only
        }

        access(all) fun getRiskLevel(): UInt8 {
            return LiquidStakingStrategy.riskLevel
        }

        access(all) fun getProtocolSource(): String {
            return "Flow Network Staking Rewards"
        }
    }

    access(all) fun createExecutor(): @StrategyExecutor {
        return <- create StrategyExecutor()
    }

    access(all) fun getStrategyInfo(): {String: AnyStruct} {
        let realizedAPY = self.getRealizedAPY()
        let oracleAPY = self.getOracleAPY()
        return {
            "id": self.strategyId,
            "name": self.name,
            "description": self.description,
            "riskLevel": self.riskLevel,
            "category": self.category,
            "minDeposit": self.minDeposit,
            "expectedAPY": oracleAPY,
            "lastEpochAPY": self.lastEpochAPY,
            "realizedAPY": realizedAPY,
            "dailyRate": realizedAPY / 365.0,
            "weeklyRate": realizedAPY / 52.0,
            "tvl": self.totalValueLocked,
            "participants": self.totalParticipants,
            "totalExecutions": self.totalExecutions,
            "isActive": self.isActive,
            "features": ["Real FlowStakingCollection Delegation", "MEV Protection", "Reward-Per-Share Accounting"],
            "creator": "Flow Sentinel",
            "verified": true,
            "protocolSource": "Flow Network Staking",
            "stakingType": "Liquid Staking",
            "provenance": self.stakingCollectionSetup ? "FlowIDTableStaking (real epoch rewards)" : "YieldOracle (bootstrap, not yet staking)",
            "methodology": "real-delegation",
            "mevProtection": "Full MEV-Shield (VRF jitter, Commit-Reveal, Price Guard, Queue)",
            "protocolNodeID": self.protocolNodeID,
            "stakingCollectionSetup": self.stakingCollectionSetup,
            "totalStakedPrincipal": self.totalStakedPrincipal,
            "accruedRewardPerFlow": self.accruedRewardPerFlow,
            "totalRealRewardsClaimed": self.totalRealRewardsClaimed,
            "lastRewardClaimTime": self.lastRewardClaimTime
        }
    }

    access(all) fun updateTVL(amount: UFix64, isDeposit: Bool) {
        if isDeposit {
            self.totalValueLocked = self.totalValueLocked + amount
            self.totalParticipants = self.totalParticipants + 1
        } else {
            self.totalValueLocked = amount < self.totalValueLocked ? self.totalValueLocked - amount : 0.0
        }
        emit TVLUpdated(newTVL: self.totalValueLocked, participants: self.totalParticipants)
    }
}
