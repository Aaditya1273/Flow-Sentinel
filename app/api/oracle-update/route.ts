import { NextResponse } from 'next/server'

// Yield integration is intentionally fail-closed. The previous route accepted
// fallback APYs and wrote them into YieldOracle even though no external
// protocol position was created. That behavior is not safe for production.

function unavailable() {
  return NextResponse.json(
    {
      enabled: false,
      error: 'Yield integrations are not enabled. No synthetic APY is published.',
    },
    { status: 503 },
  )
}

export async function POST() {
  return unavailable()
}

export async function GET() {
  return unavailable()
}
