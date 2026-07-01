import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const envText = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((line) => {
    const m = line.match(/^([^#=]+)="?([^"]*)"?$/)
    return m ? [m[1], m[2]] : []
  }).filter((x) => x.length)
)

const url = env.SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const pgUrl = env.POSTGRES_URL_NON_POOLING

const COUPLE_EMAIL = 'casal@vidalivre.app'
const COUPLE_PASSWORD = 'VidaLivre2026!Casal'

const client = new pg.Client({
  connectionString: `${pgUrl}${pgUrl.includes('?') ? '&' : '?'}uselibpqcompat=true`,
  ssl: { rejectUnauthorized: false },
})
await client.connect()

await client.query(`
create or replace function vl_couple_state_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
`)
await client.query(`
drop trigger if exists vl_couple_state_updated_at on vl_couple_state;
create trigger vl_couple_state_updated_at
  before update on vl_couple_state
  for each row execute function vl_couple_state_set_updated_at();
`)
try {
  await client.query('alter publication supabase_realtime add table vl_couple_state')
  console.log('realtime: ok')
} catch (e) {
  console.log('realtime:', e.message)
}
await client.end()
console.log('schema: ok')

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 })
const existing = list?.users?.find((u) => u.email === COUPLE_EMAIL)
if (existing) {
  await admin.auth.admin.updateUserById(existing.id, { password: COUPLE_PASSWORD, email_confirm: true })
  console.log('user: updated')
} else {
  const { error } = await admin.auth.admin.createUser({
    email: COUPLE_EMAIL,
    password: COUPLE_PASSWORD,
    email_confirm: true,
  })
  if (error) throw error
  console.log('user: created')
}

const anon = createClient(url, anonKey)
const { error: signErr } = await anon.auth.signInWithPassword({ email: COUPLE_EMAIL, password: COUPLE_PASSWORD })
if (signErr) throw signErr
const { error: upsErr } = await anon.from('vl_couple_state').upsert({ id: 'main', data: { ok: true } })
if (upsErr) throw upsErr
console.log('auth + upsert: ok')
