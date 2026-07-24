// lib/supabase.ts — Phase 6: Supabase client + schema types
// Supabase is used for: user profiles, notification settings, notifications, execution log.
// Auth is wallet-based (Flow signature) — no passwords needed.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ?? ''

// Only create clients when URL is configured — avoids startup crash during build
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as ReturnType<typeof createClient>

export const supabaseAdmin = supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as unknown as ReturnType<typeof createClient>

// ── Database schema types ──

export interface UserProfile {
  wallet_address: string
  display_name: string | null
  email: string | null
  timezone: string
  language: string
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  wallet_address: string
  email_notifications: boolean
  push_notifications: boolean
  vault_alerts: boolean
  performance_reports: boolean
  security_alerts: boolean
  marketing_emails: boolean
}

export interface Notification {
  id: string
  wallet_address: string
  type: 'vault_alert' | 'yield_claim' | 'mev_blocked' | 'execution' | 'security' | 'system'
  title: string
  body: string | null
  read: boolean
  created_at: string
}

export interface ExecutionLog {
  id: string
  wallet_address: string
  vault_id: string
  tx_id: string
  strategy_id: string
  yield_amount: number | null
  mev_layers_active: number | null
  protocol_source: string | null
  realized_apy: number | null
  execution_at: string
}

// ── SQL schema — run this once in Supabase dashboard ──
// Save this for reference; it's not executed here.
export const SCHEMA_SQL = `
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- User profiles linked to Flow wallet addresses
create table if not exists user_profiles (
  wallet_address text primary key,
  display_name   text,
  email          text unique,
  timezone       text not null default 'UTC',
  language       text not null default 'en',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Notification preferences per user
create table if not exists notification_settings (
  wallet_address      text primary key references user_profiles(wallet_address) on delete cascade,
  email_notifications boolean not null default true,
  push_notifications  boolean not null default true,
  vault_alerts        boolean not null default true,
  performance_reports boolean not null default true,
  security_alerts     boolean not null default true,
  marketing_emails    boolean not null default false
);

-- Notification log
create table if not exists notifications (
  id             uuid primary key default gen_random_uuid(),
  wallet_address text not null references user_profiles(wallet_address) on delete cascade,
  type           text not null,
  title          text not null,
  body           text,
  read           boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Strategy execution log (supplements on-chain events)
create table if not exists execution_log (
  id               uuid primary key default gen_random_uuid(),
  wallet_address   text not null,
  vault_id         text not null,
  tx_id            text not null,
  strategy_id      text,
  yield_amount     numeric(20,8),
  mev_layers_active integer,
  protocol_source  text,
  realized_apy     numeric(10,4),
  execution_at     timestamptz not null default now()
);

-- Row Level Security: users can only read/write their own data
alter table user_profiles       enable row level security;
alter table notification_settings enable row level security;
alter table notifications        enable row level security;
alter table execution_log        enable row level security;

-- RLS policies — wallet_address matches the JWT claim set during wallet auth
create policy "users_own_profile"    on user_profiles       using (wallet_address = current_setting('app.wallet_address', true));
create policy "users_own_notif_set"  on notification_settings using (wallet_address = current_setting('app.wallet_address', true));
create policy "users_own_notifs"     on notifications        using (wallet_address = current_setting('app.wallet_address', true));
create policy "users_own_exec_log"   on execution_log        using (wallet_address = current_setting('app.wallet_address', true));

-- Indexes for fast lookups
create index if not exists notifications_wallet_idx on notifications(wallet_address, created_at desc);
create index if not exists exec_log_wallet_idx       on execution_log(wallet_address, execution_at desc);
`
