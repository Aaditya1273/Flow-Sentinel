import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from 'lib/supabase'
import { verifyWalletAuth } from 'lib/wallet-auth'
import type { UserProfile, NotificationSettings } from 'lib/supabase'

// ── Settings API — Phase 6 ──
// GET  /api/settings  — returns profile + notification prefs for authenticated wallet
// PUT  /api/settings  — upserts profile + notification prefs
// All requests require wallet-signed authentication headers.

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY' }, { status: 503 })
  }
  const address = await verifyWalletAuth(req.headers)
  if (!address) {
    return NextResponse.json({ error: 'Unauthorized — valid wallet signature required' }, { status: 401 })
  }

  // Fetch profile and notification settings in parallel
  const [profileRes, notifRes] = await Promise.all([
    supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', address)
      .single(),
    supabaseAdmin
      .from('notification_settings')
      .select('*')
      .eq('wallet_address', address)
      .single(),
  ])

  // Return defaults if profile doesn't exist yet
  const profile: Partial<UserProfile> = profileRes.data ?? {
    wallet_address: address,
    display_name: null,
    email: null,
    timezone: 'UTC',
    language: 'en',
  }

  const notifs: Partial<NotificationSettings> = notifRes.data ?? {
    wallet_address: address,
    email_notifications: true,
    push_notifications: true,
    vault_alerts: true,
    performance_reports: true,
    security_alerts: true,
    marketing_emails: false,
  }

  return NextResponse.json({ profile, notifications: notifs })
}

export async function PUT(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  const address = await verifyWalletAuth(req.headers)
  if (!address) {
    return NextResponse.json({ error: 'Unauthorized — valid wallet signature required' }, { status: 401 })
  }

  let body: { profile?: Partial<UserProfile>; notifications?: Partial<NotificationSettings> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const errors: string[] = []

  // Upsert profile
  if (body.profile) {
    const profileData = {
      wallet_address: address,
      display_name: body.profile.display_name ?? null,
      email: body.profile.email ?? null,
      timezone: body.profile.timezone ?? 'UTC',
      language: body.profile.language ?? 'en',
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'wallet_address' })
    if (error) errors.push(`profile: ${error.message}`)
  }

  // Upsert notification settings
  if (body.notifications) {
    const notifData = {
      wallet_address: address,
      email_notifications: body.notifications.email_notifications ?? true,
      push_notifications: body.notifications.push_notifications ?? true,
      vault_alerts: body.notifications.vault_alerts ?? true,
      performance_reports: body.notifications.performance_reports ?? true,
      security_alerts: body.notifications.security_alerts ?? true,
      marketing_emails: body.notifications.marketing_emails ?? false,
    }
    const { error } = await supabaseAdmin
      .from('notification_settings')
      .upsert(notifData, { onConflict: 'wallet_address' })
    if (error) errors.push(`notifications: ${error.message}`)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Partial failure', details: errors }, { status: 500 })
  }

  return NextResponse.json({ success: true, savedAt: new Date().toISOString() })
}

export async function DELETE(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  const address = await verifyWalletAuth(req.headers)
  if (!address) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Cascade delete via FK: deleting profile cascades to notification_settings and notifications
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .delete()
    .eq('wallet_address', address)

  if (error) {
    return NextResponse.json({ error: 'Delete failed', details: error.message }, { status: 500 })
  }

  // Also clean up execution_log (no FK cascade there)
  await supabaseAdmin.from('execution_log').delete().eq('wallet_address', address)

  return NextResponse.json({ success: true, deletedAddress: address })
}
