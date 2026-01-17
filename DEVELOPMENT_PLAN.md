# Flow Sentinel - 2 Hour Development Plan

## Phase 1: Core Smart Contracts (45 minutes)
**Goal**: Build the essential Cadence contracts that showcase Forte features

### Tasks:
1. **SentinelVault.cdc** (25 min)
   - Core vault resource with deposit/withdraw
   - FlowTransactionScheduler integration
   - Native VRF for MEV protection
   - Emergency pause mechanism

2. **SentinelInterfaces.cdc** (10 min)
   - Standard interfaces for vault operations
   - Event definitions

3. **Basic transactions** (10 min)
   - init_sentinel.cdc
   - schedule_rebalance.cdc

**Deliverable**: Working Cadence contracts that demonstrate autonomous scheduling and VRF

---

## Phase 2: Minimal Frontend (45 minutes)
**Goal**: Create a functional web interface showcasing key features

### Tasks:
1. **Next.js setup** (15 min)
   - Initialize app with FCL integration
   - Basic project structure

2. **Core UI components** (20 min)
   - Vault dashboard
   - Deposit/withdraw interface
   - Emergency pause button
   - Status indicators

3. **Flow integration** (10 min)
   - Wallet connection
   - Basic transaction handling
   - Account authentication

**Deliverable**: Working web app that connects to Flow and interacts with contracts

---

## Phase 3: Documentation & Demo (30 minutes)
**Goal**: Complete the grant application package

### Tasks:
1. **README.md** (15 min)
   - Project overview
   - Technical highlights
   - Setup instructions
   - Grant alignment

2. **Demo preparation** (10 min)
   - Test scenarios
   - Screenshots/recordings
   - Key talking points

3. **Final polish** (5 min)
   - Code cleanup
   - Comments
   - Error handling

**Deliverable**: Complete grant-ready repository with documentation

---

## Success Metrics
- ✅ Autonomous vault that schedules its own transactions
- ✅ Native VRF integration for MEV protection
- ✅ Passkey-based emergency controls
- ✅ Working web interface
- ✅ Grant-ready documentation

## Technology Focus
- **Cadence 1.0** with UFix128 precision
- **Forte Scheduled Transactions**
- **Native VRF** (revertibleRandom)
- **Flow Account Abstraction**
- **Next.js + FCL**

## Risk Mitigation
- Keep scope minimal but functional
- Focus on grant judging criteria
- Prioritize working demo over perfect code
- Document any limitations clearly