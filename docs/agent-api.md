# Flow Sentinel Agent API

The agent API is currently read-only scaffolding. Strategy execution, rebalancing,
oracle publication, yield claims, and autonomous vault management are disabled.

Do not use APY, yield, strategy, or scheduling fields from older examples as
production data. They described prototype behavior that was removed because it
did not represent realized external protocol proceeds.

The API returns an explicit `503` for disabled mutation endpoints until a real
audited adapter and production authorization model are deployed.
