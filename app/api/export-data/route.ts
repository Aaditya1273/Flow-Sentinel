import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from 'lib/supabase'
import { verifyWalletAuth } from 'lib/wallet-auth'

// ── Export Data API — Phase 6 ──
// GET /api/export-data — returns all user data as CSV
// Used by "Export Data" button in settings

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  const address = await verifyWalletAuth(req.headers)
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch execution log for the user
  const { data: execLog } = await supabaseAdmin
    .from('execution_log')
    .select('*')
    .eq('wallet_address', address)
    .order('execution_at', { ascending: false })
    .limit(1000)

  const { data: notifications } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('wallet_address', address)
    .order('created_at', { ascending: false })
    .limit(500)

  // Build CSV
  const execHeaders = 'vault_id,strategy_id,tx_id,yield_amount,realized_apy,protocol_source,mev_layers_active,execution_at'
  const execRows = (execLog ?? []).map(r =>
    [r.vault_id, r.strategy_id, r.tx_id, r.yield_amount, r.realized_apy, r.protocol_source, r.mev_layers_active, r.execution_at]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )

  const notifHeaders = 'type,title,body,read,created_at'
  const notifRows = (notifications ?? []).map(n =>
    [n.type, n.title, n.body, n.read, n.created_at]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )

  const csv = [
    `# Flow Sentinel — Export for ${address}`,
    `# Generated: ${new Date().toISOString()}`,
    '',
    '## Execution Log',
    execHeaders,
    ...execRows,
    '',
    '## Notifications',
    notifHeaders,
    ...notifRows,
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="flow-sentinel-export-${address.slice(0, 8)}.csv"`,
    },
  })
}
