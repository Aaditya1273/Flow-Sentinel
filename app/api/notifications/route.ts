import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from 'lib/supabase'
import { verifyWalletAuth } from 'lib/wallet-auth'

// ── Notifications API — Phase 6 ──
// GET  /api/notifications           — list recent notifications
// PUT  /api/notifications?id=<id>   — mark one notification as read
// PUT  /api/notifications?all=true  — mark all as read

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ notifications: [], unreadCount: 0 })
  const address = await verifyWalletAuth(req.headers)
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20')
  const unreadOnly = req.nextUrl.searchParams.get('unread') === 'true'

  let query = supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('wallet_address', address)
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 100))

  if (unreadOnly) query = query.eq('read', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const unreadCount = (data ?? []).filter(n => !n.read).length
  return NextResponse.json({ notifications: data ?? [], unreadCount })
}

export async function PUT(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  const address = await verifyWalletAuth(req.headers)
  if (!address) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = req.nextUrl.searchParams.get('all') === 'true'
  const id = req.nextUrl.searchParams.get('id')

  if (all) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('wallet_address', address)
      .eq('read', false)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, markedAll: true })
  }

  if (id) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('wallet_address', address)  // RLS: users can only update their own
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, markedId: id })
  }

  return NextResponse.json({ error: 'Provide ?id=<uuid> or ?all=true' }, { status: 400 })
}
