-- Vida Livre (novo) — schema relacional
-- Todo registro financeiramente relevante carrega um campo `contexto` explícito
-- ('comigo' | 'sozinha' | 'outro'), nunca inferido.

create extension if not exists pgcrypto;

create table if not exists vl_actors (
  id text primary key,
  nome text not null,
  emoji text
);
insert into vl_actors (id, nome) values
  ('bruno', 'Bruno'),
  ('vianka', 'Vianka')
on conflict (id) do nothing;

create table if not exists vl_regras (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('permitido', 'proibido', 'liberdade', 'protocolo')),
  texto text not null,
  detalhes text,
  ativo boolean not null default true,
  criado_por text references vl_actors(id),
  revisado_em date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vl_regras_intro (
  id text primary key default 'main',
  texto text not null default '',
  updated_at timestamptz not null default now()
);
insert into vl_regras_intro (id) values ('main') on conflict (id) do nothing;

create table if not exists vl_saldo_config (
  lado text primary key check (lado in ('marido', 'esposa')),
  credito_ciclo numeric(10, 2) not null default 0,
  saldo numeric(10, 2) not null default 0,
  ultimo_credito_mes text,
  limites jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into vl_saldo_config (lado, credito_ciclo, saldo) values
  ('esposa', 2000, 2000),
  ('marido', 0, 0)
on conflict (lado) do nothing;

create table if not exists vl_movimentos (
  id uuid primary key default gen_random_uuid(),
  lado text not null references vl_saldo_config(lado),
  tipo text not null check (tipo in ('credito', 'debito')),
  valor numeric(10, 2) not null,
  contexto text check (contexto in ('comigo', 'sozinha', 'outro')),
  origem text not null check (origem in ('manual', 'pedido', 'encontro', 'presente_pix')),
  origem_id uuid,
  categoria text,
  nota text,
  registrado_por text references vl_actors(id),
  mes text not null,
  created_at timestamptz not null default now()
);
create index if not exists vl_movimentos_lado_mes_idx on vl_movimentos (lado, mes);
create index if not exists vl_movimentos_origem_idx on vl_movimentos (origem, origem_id);

create table if not exists vl_pedidos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  como text,
  categoria text,
  valor numeric(10, 2),
  contexto text not null check (contexto in ('comigo', 'sozinha', 'outro')),
  recorrente boolean not null default false,
  periodicidade text check (periodicidade in ('mensal', 'semestral', 'anual')),
  prioridade text check (prioridade in ('baixa', 'media', 'alta', 'urgente')),
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'negado', 'disponivel', 'resgatado', 'realizado')),
  resposta text,
  respondido_por text references vl_actors(id),
  usado_mes text,
  pago_mes text,
  criado_por text references vl_actors(id),
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vl_pedidos_status_idx on vl_pedidos (status);
create index if not exists vl_pedidos_recorrente_idx on vl_pedidos (recorrente);

create table if not exists vl_encontros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null check (tipo in ('saida', 'date')),
  contexto text not null check (contexto in ('comigo', 'sozinha', 'outro')),
  data date,
  hora time,
  com_quem text,
  local text,
  status text not null default 'planejado' check (status in ('planejado', 'aconteceu', 'realizado', 'cancelado')),
  share text default 'resumo' check (share in ('contou', 'resumo', 'privado')),
  notas text,
  criado_por text references vl_actors(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vl_encontros_data_idx on vl_encontros (data);

create table if not exists vl_presentes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('presente', 'pix')),
  descricao text,
  valor numeric(10, 2) not null,
  data date not null default current_date,
  dado_por text references vl_actors(id),
  created_at timestamptz not null default now()
);

-- RLS: login único compartilhado, sem scoping por linha — authenticated pode tudo.
alter table vl_actors enable row level security;
alter table vl_regras enable row level security;
alter table vl_regras_intro enable row level security;
alter table vl_saldo_config enable row level security;
alter table vl_movimentos enable row level security;
alter table vl_pedidos enable row level security;
alter table vl_encontros enable row level security;
alter table vl_presentes enable row level security;

drop policy if exists "vl_actors_auth" on vl_actors;
create policy "vl_actors_auth" on vl_actors for all to authenticated using (true) with check (true);
drop policy if exists "vl_regras_auth" on vl_regras;
create policy "vl_regras_auth" on vl_regras for all to authenticated using (true) with check (true);
drop policy if exists "vl_regras_intro_auth" on vl_regras_intro;
create policy "vl_regras_intro_auth" on vl_regras_intro for all to authenticated using (true) with check (true);
drop policy if exists "vl_saldo_config_auth" on vl_saldo_config;
create policy "vl_saldo_config_auth" on vl_saldo_config for all to authenticated using (true) with check (true);
drop policy if exists "vl_movimentos_auth" on vl_movimentos;
create policy "vl_movimentos_auth" on vl_movimentos for all to authenticated using (true) with check (true);
drop policy if exists "vl_pedidos_auth" on vl_pedidos;
create policy "vl_pedidos_auth" on vl_pedidos for all to authenticated using (true) with check (true);
drop policy if exists "vl_encontros_auth" on vl_encontros;
create policy "vl_encontros_auth" on vl_encontros for all to authenticated using (true) with check (true);
drop policy if exists "vl_presentes_auth" on vl_presentes;
create policy "vl_presentes_auth" on vl_presentes for all to authenticated using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table vl_regras, vl_regras_intro, vl_saldo_config, vl_movimentos, vl_pedidos, vl_encontros, vl_presentes;
