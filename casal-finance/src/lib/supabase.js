import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/*
============================================================
  SUPABASE SQL — rode no SQL Editor do painel do Supabase
============================================================

-- 1. Tabela de transações
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  category text not null,       -- 'work' | 'personal' | 'wife' | 'savings' | 'company'
  type text not null,           -- 'income' | 'expense'
  amount numeric(12,2) not null,
  date date not null default current_date,
  month text not null,          -- formato 'YYYY-MM'
  created_at timestamptz default now()
);

-- 2. Tabela de metas de poupança
create table savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target numeric(12,2) not null,
  current numeric(12,2) default 0,
  emoji text default '🎯',
  created_at timestamptz default now()
);

-- 3. Tabela de configurações do casal
create table couple_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  wife_percentage numeric(5,2) default 30,
  couple_name text default 'Nosso Casal',
  updated_at timestamptz default now()
);

-- 4. Row Level Security (RLS)
alter table transactions enable row level security;
alter table savings_goals enable row level security;
alter table couple_settings enable row level security;

create policy "users see own data" on transactions for all using (auth.uid() = user_id);
create policy "users see own data" on savings_goals for all using (auth.uid() = user_id);
create policy "users see own data" on couple_settings for all using (auth.uid() = user_id);

============================================================
*/
