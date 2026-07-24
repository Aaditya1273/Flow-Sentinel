import type { Handler } from '@netlify/functions'

// ── Oracle Keeper — Netlify Scheduled Function (Phase 4) ──
// Calls the oracle-update API route every 6 hours to keep APY data fresh.
// Schedule is defined in netlify.toml: schedule = "0 */6 * * *"
//
// Environment variables required:
//   CRON_SECRET           — shared secret between this function and the API route
//   NEXT_PUBLIC_BASE_URL  — deployed app URL (e.g. https://flow-sentinel.netlify.app)

export const handler: Handler = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const cronSecret = process.env.CRON_SECRET ?? ''

  if (!cronSecret) {
    console.error('[oracle-keeper] CRON_SECRET not set')
    return { statusCode: 500, body: 'CRON_SECRET not configured' }
  }

  try {
    const res = await fetch(`${baseUrl}/api/oracle-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cronSecret}`,
      },
    })

    const body = await res.json()

    if (!res.ok) {
      console.error('[oracle-keeper] API returned error:', body)
      return { statusCode: res.status, body: JSON.stringify(body) }
    }

    console.log('[oracle-keeper] Oracle updated successfully:', JSON.stringify(body, null, 2))
    return { statusCode: 200, body: JSON.stringify({ success: true, ...body }) }
  } catch (err) {
    console.error('[oracle-keeper] Fetch failed:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Oracle keeper failed', details: String(err) }),
    }
  }
}
