-- Vida Livre — estado compartilhado do casal (cole no SQL Editor do Supabase)

create table if not exists vl_couple_state (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table vl_couple_state enable row level security;

drop policy if exists "vl_couple_state_authenticated" on vl_couple_state;
create policy "vl_couple_state_authenticated"
  on vl_couple_state for all
  to authenticated
  using (true)
  with check (true);

-- Trigger para updated_at automático
create or replace function vl_couple_state_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists vl_couple_state_updated_at on vl_couple_state;
create trigger vl_couple_state_updated_at
  before update on vl_couple_state
  for each row execute function vl_couple_state_set_updated_at();

-- Realtime: em Database → Replication, habilite vl_couple_state
-- (ou, se disponível no seu projeto: alter publication supabase_realtime add table vl_couple_state;)
