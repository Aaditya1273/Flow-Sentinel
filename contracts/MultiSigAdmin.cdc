// MultiSigAdmin — M-of-N multi-signature authorization for Sentinel admin operations
access(all) contract MultiSigAdmin {

    access(all) entitlement Propose
    access(all) entitlement Sign
    access(all) entitlement Execute

    access(all) event AdminAdded(admin: Address)
    access(all) event AdminRemoved(admin: Address)
    access(all) event ProposalCreated(id: UInt64, action: String, proposer: Address)
    access(all) event ProposalSigned(id: UInt64, signer: Address)
    access(all) event ProposalExecuted(id: UInt64, executor: Address)
    access(all) event ThresholdChanged(oldThreshold: UInt64, newThreshold: UInt64)

    access(all) let MultiSigStoragePath: StoragePath
    access(all) let MultiSigPublicPath: PublicPath

    access(all) enum ActionType: UInt8 {
        access(all) case FundYieldReserve
        access(all) case UpdateYieldOracle
        access(all) case EmergencyPause
        access(all) case UpgradeContract
        access(all) case AddAdmin
        access(all) case RemoveAdmin
        access(all) case ChangeThreshold
        access(all) case Custom
    }

    access(all) struct Signature {
        access(all) let admin: Address
        access(all) let timestamp: UFix64

        init(_ admin: Address) {
            self.admin = admin
            self.timestamp = getCurrentBlock().timestamp
        }
    }

    access(all) struct Proposal {
        access(all) let id: UInt64
        access(all) let actionType: ActionType
        access(all) let description: String
        access(all) let proposer: Address
        access(all) let createdAt: UFix64
        access(self) var executed: Bool
        access(self) var signatures: {Address: Signature}
        access(all) let calldata: {String: AnyStruct}

        init(id: UInt64, actionType: ActionType, description: String, proposer: Address, calldata: {String: AnyStruct}) {
            self.id = id
            self.actionType = actionType
            self.description = description
            self.proposer = proposer
            self.createdAt = getCurrentBlock().timestamp
            self.executed = false
            self.signatures = {}
            self.calldata = calldata
        }

        access(all) fun getSignatureCount(): UInt64 {
            return UInt64(self.signatures.length)
        }

        access(all) fun hasSigned(_ address: Address): Bool {
            return self.signatures[address] != nil
        }

        access(all) fun addSignature(_ address: Address) {
            pre { !self.executed: "Proposal already executed" }
            self.signatures[address] = Signature(address)
        }

        access(all) fun markExecuted() {
            pre { !self.executed: "Proposal already executed" }
            self.executed = true
        }

        access(all) fun isExecuted(): Bool {
            return self.executed
        }
    }

    access(all) resource interface AdminPublic {
        access(all) fun getProposal(id: UInt64): Proposal?
        access(all) fun getPendingProposals(): [Proposal]
        access(all) fun getExecutedProposals(): [Proposal]
        access(all) fun getAdminCount(): UInt64
        access(all) fun getRequiredSignatures(): UInt64
        access(all) fun isAdminAddress(_ addr: Address): Bool
        access(all) fun getAdmins(): [Address]
    }

    access(all) resource Admin: AdminPublic {
        access(all) var proposalCounter: UInt64
        access(all) var proposals: {UInt64: Proposal}

        init() {
            self.proposalCounter = 0
            self.proposals = {}
        }

        access(Propose) fun proposeAction(actionType: ActionType, description: String, calldata: {String: AnyStruct}, caller: Address): UInt64 {
            if !MultiSigAdmin.isAdmin(caller) {
                panic("Only registered admins can propose actions")
            }
            let id = self.proposalCounter
            let proposal = Proposal(id: id, actionType: actionType, description: description, proposer: caller, calldata: calldata)
            self.proposals[id] = proposal
            self.proposalCounter = self.proposalCounter + 1
            emit ProposalCreated(id: id, action: description, proposer: caller)
            return id
        }

        access(Sign) fun signProposal(proposalId: UInt64, caller: Address) {
            if !MultiSigAdmin.isAdmin(caller) {
                panic("Only registered admins can sign proposals")
            }
            if self.proposals[proposalId] == nil {
                panic("Proposal not found")
            }
            let proposalRef = (&self.proposals[proposalId] as &Proposal?)!
            if proposalRef.isExecuted() {
                panic("Proposal already executed")
            }
            if proposalRef.hasSigned(caller) {
                panic("Already signed")
            }
            proposalRef.addSignature(caller)
            emit ProposalSigned(id: proposalId, signer: caller)
        }

        access(Execute) fun executeProposal(proposalId: UInt64, caller: Address) {
            if !MultiSigAdmin.isAdmin(caller) {
                panic("Only registered admins can execute proposals")
            }
            if self.proposals[proposalId] == nil {
                panic("Proposal not found")
            }
            let proposalRef = (&self.proposals[proposalId] as &Proposal?)!
            if proposalRef.isExecuted() {
                panic("Proposal already executed")
            }
            if proposalRef.getSignatureCount() < MultiSigAdmin.requiredSignatures {
                panic("Not enough signatures")
            }
            proposalRef.markExecuted()
            emit ProposalExecuted(id: proposalId, executor: caller)
        }

        access(all) fun getProposal(id: UInt64): Proposal? {
            return self.proposals[id]
        }

        access(all) fun getPendingProposals(): [Proposal] {
            var pending: [Proposal] = []
            for id in self.proposals.keys {
                let proposal = self.proposals[id]!
                if !proposal.isExecuted() {
                    pending.append(proposal)
                }
            }
            return pending
        }

        access(all) fun getExecutedProposals(): [Proposal] {
            var executedList: [Proposal] = []
            for id in self.proposals.keys {
                let proposal = self.proposals[id]!
                if proposal.isExecuted() {
                    executedList.append(proposal)
                }
            }
            return executedList
        }

        access(all) fun getAdminCount(): UInt64 {
            return MultiSigAdmin.totalAdmins
        }

        access(all) fun getRequiredSignatures(): UInt64 {
            return MultiSigAdmin.requiredSignatures
        }

        access(all) fun isAdminAddress(_ addr: Address): Bool {
            return MultiSigAdmin.isAdmin(addr)
        }

        access(all) fun getAdmins(): [Address] {
            return MultiSigAdmin.getAdminList()
        }
    }

    access(self) var admins: {Address: Bool}
    access(self) var adminList: [Address]
    access(all) var totalAdmins: UInt64
    access(all) var requiredSignatures: UInt64

    init() {
        self.MultiSigStoragePath = /storage/SentinelMultiSig
        self.MultiSigPublicPath = /public/SentinelMultiSig
        self.admins = {}
        self.adminList = []
        self.totalAdmins = 0
        self.requiredSignatures = 2

        self.addAdminInternal(self.account.address)
    }

    access(self) fun addAdminInternal(_ addr: Address) {
        self.admins[addr] = true
        self.adminList.append(addr)
        self.totalAdmins = self.totalAdmins + 1
        emit AdminAdded(admin: addr)
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  SECURITY NOTICE: Contract-level admin management functions
    // ═══════════════════════════════════════════════════════════════════════
    //
    //  Cadence contract-level `access(all)` functions CANNOT verify the
    //  caller's identity (no msg.sender equivalent). A pattern like:
    //    `pre { MultiSigAdmin.isAdmin(self.account.address) }`
    //  is a security NO-OP because self.account.address always resolves
    //  to the contract account, which is always an admin of itself.
    //
    //  Therefore the following functions have been REMOVED:
    //    - addAdminFromContract     — anyone could add themselves as admin
    //    - removeAdminFromContract  — anyone could remove admins
    //    - changeThreshold          — anyone could change signature threshold
    //
    //  Admin management MUST go through the Admin resource flow:
    //    1. borrow Admin resource with entitlements
    //    2. proposeAction → signProposal → executeProposal
    //
    // ═══════════════════════════════════════════════════════════════════════

    access(all) fun isAdmin(_ addr: Address): Bool {
        return self.admins[addr] ?? false
    }

    access(all) fun getAdminList(): [Address] {
        return self.adminList
    }

    access(all) fun getRequiredSignatures(): UInt64 {
        return self.requiredSignatures
    }

    access(all) fun createAdmin(): @Admin {
        return <- create Admin()
    }
}
