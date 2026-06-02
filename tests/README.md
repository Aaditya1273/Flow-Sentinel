# Flow Sentinel — Test Suite

## Cadence Tests (Smart Contracts)

These test the on-chain smart contracts using Flow's built-in test framework.

### Prerequisites

```bash
# Install Flow CLI
curl -sL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh | sh

# Start emulator
flow emulator --start
```

### Run Cadence Tests

```bash
# Run V2 vault tests
flow test tests/SentinelVaultV2_test.cdc

# Run strategy contract tests
flow test tests/strategy_test.cdc

# Run V1 vault tests (legacy)
flow test tests/SentinelVault_test.cdc
```

## TypeScript Tests (Frontend Hooks)

These test the frontend data layer (`FlowService`, hooks).

### Setup

```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest

# Create jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^lib/(.*)$': '<rootDir>/lib/$1',
    '^hooks/(.*)$': '<rootDir>/hooks/$1',
    '^components/(.*)$': '<rootDir>/components/$1',
  },
}
EOF
```

### Run TypeScript Tests

```bash
# Start Flow emulator
flow emulator --start

# Deploy contracts to emulator
flow project deploy --network emulator

# Run hook tests
npx jest tests/hooks.test.ts --verbose
```

## Test Coverage

| Test File | What It Tests |
|-----------|---------------|
| `SentinelVaultV2_test.cdc` | V2 vault: create, deposit, withdraw, pause/resume, strategy, claimYield, multiple vaults, edge cases |
| `strategy_test.cdc` | All 3 strategies: executor creation, IStrategy compliance, yield generation, edge cases |
| `SentinelVault_test.cdc` | V1 vault: basic create, deposit, emergency pause |
| `hooks.test.ts` | Frontend: FlowService queries, transactions, event parsing, PnL calculation |
