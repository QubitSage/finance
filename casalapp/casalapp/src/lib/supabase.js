import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/*
================================================================
  SUPABASE SQL — Cole e execute no SQL Editor do seu projeto
================================================================

-- CONFIGURAÇÕES DO CASAL
create table couple_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  couple_name text default 'Nosso Casal',
  wife_percentage numeric(5,2) default 30,
  updated_at timestamptz default now()
);

-- TRANSAÇÕES FINANCEIRAS
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  category text not null,
  type text not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  month text not null,
  created_at timestamptz default now()
);

-- METAS DE POUPANÇA
create table savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target numeric(12,2) not null,
  current numeric(12,2) default 0,
  emoji text default '🎯',
  created_at timestamptz default now()
);

-- REGRAS DO CASAL
create table rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  text text not null,
  created_at timestamptz default now()
);

-- VIAGENS
create table trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  destination text not null,
  category text,
  status text default 'interesse',
  start_date date,
  end_date date,
  budget numeric(12,2) default 0,
  spent numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now()
);

-- DESEJOS
create table desires (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  who text not null,
  desire text not null,
  why text,
  tipo text,
  category text,
  cost numeric(12,2) default 0,
  date date,
  status text default 'Pendente',
  created_at timestamptz default now()
);

-- MIMOS
create table mimos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date,
  mimo text not null,
  objective text,
  tipo text,
  category text,
  obj_tipo text,
  value numeric(12,2) default 0,
  status text default 'Pendente',
  created_at timestamptz default now()
);

-- PLANNER ROUNDS
create table planner_rounds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  atividade text,
  companhia text,
  visual text,
  desejo text,
  comunicacao text,
  created_at timestamptz default now()
);

-- PLANNER OPTIONS
create table planner_options (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  column_name text not null,
  option_text text not null,
  created_at timestamptz default now()
);

-- QUESTIONÁRIO
create table quiz_questions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  question text not null,
  who text default 'Ambos',
  created_at timestamptz default now()
);
create table quiz_answers (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references quiz_questions on delete cascade not null,
  who text not null,
  answer text not null,
  created_at timestamptz default now()
);

-- DADOS DO CASAL (PERFIL)
create table couple_profile (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  data jsonb default '{}',
  updated_at timestamptz default now()
);

-- MERCADO
create table market_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text,
  item text not null,
  brand text,
  unit text,
  quantity numeric,
  frequency text,
  priority text,
  responsible text,
  status text default 'Comprar',
  notes text,
  created_at timestamptz default now()
);
create table home_stock (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

-- APARTAMENTO
create table apartment_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  room text,
  item text not null,
  size text,
  value numeric(12,2) default 0,
  brand text,
  model text,
  link text,
  status text default 'Desejado',
  created_at timestamptz default now()
);

-- CASAMENTO
create table wedding (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  location text,
  date date,
  budget numeric(12,2) default 0,
  updated_at timestamptz default now()
);
create table wedding_guests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  side text,
  confirmed text default 'Pendente',
  created_at timestamptz default now()
);

-- METAS PESSOAIS
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  goal text not null,
  responsible text,
  category text,
  tipo text,
  status text default 'Em andamento',
  deadline date,
  reward text,
  created_at timestamptz default now()
);

-- COMPROMISSOS
create table commitments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  day_of_week text not null,
  time_slot text not null,
  title text not null,
  responsible text,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY (RLS)
alter table couple_settings    enable row level security;
alter table transactions        enable row level security;
alter table savings_goals       enable row level security;
alter table rules               enable row level security;
alter table trips               enable row level security;
alter table desires             enable row level security;
alter table mimos               enable row level security;
alter table planner_rounds      enable row level security;
alter table planner_options     enable row level security;
alter table quiz_questions      enable row level security;
alter table quiz_answers        enable row level security;
alter table couple_profile      enable row level security;
alter table market_items        enable row level security;
alter table home_stock          enable row level security;
alter table apartment_items     enable row level security;
alter table wedding             enable row level security;
alter table wedding_guests      enable row level security;
alter table goals               enable row level security;
alter table commitments         enable row level security;

-- POLICIES (repita o padrão para cada tabela)
do $$
declare t text;
begin
  foreach t in array array[
    'couple_settings','transactions','savings_goals','rules','trips',
    'desires','mimos','planner_rounds','planner_options','quiz_questions',
    'quiz_answers','couple_profile','market_items','home_stock',
    'apartment_items','wedding','wedding_guests','goals','commitments'
  ] loop
    execute format('create policy "own data" on %I for all using (auth.uid() = user_id)', t);
  end loop;
end $$;

================================================================
*/
