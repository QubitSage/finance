/**
 * Setup único: schema + usuário do casal. Uso local (não commitar).
 * node scripts/setup-supabase.mjs
 */
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

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const pgUrl = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL

const COUPLE_EMAIL = 'casal@vidalivre.app'
const COUPLE_PASSWORD = 'VidaLivre2026!Casal'

if (!url || !serviceKey || !pgUrl) {
  console.error('Faltam variáveis no .env.local')
  process.exit(1)
}

const schema = readFileSync('supabase/schema.sql', 'utf8')
const sqlStatements = schema
  .split(';')
  .map((s) => s.replace(/--[^\n]*/g, '').trim())
  .filter((s) => s.length > 0 && !s.startsWith('('))

async function runSchema() {
  const client = new pg.Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  for (const stmt of sqlStatements) {
    try {
      await client.query(stmt)
      console.log('OK:', stmt.slice(0, 60).replace(/\s+/g, ' ') + '…')
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('skip (exists):', stmt.slice(0, 40))
      } else {
        throw err
      }
    }
  }
  try {
    await client.query('alter publication supabase_realtime add table vl_couple_state')
    console.log('OK: realtime publication')
  } catch (err) {
    console.log('realtime:', err.message)
  }
  await client.end()
}

async function ensureCoupleUser() {
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 })
  const existing = list?.users?.find((u) => u.email === COUPLE_EMAIL)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password: COUPLE_PASSWORD, email_confirm: true })
    console.log('Usuário casal atualizado:', COUPLE_EMAIL)
    return
  }
  const { error } = await admin.auth.admin.createUser({
    email: COUPLE_EMAIL,
    password: COUPLE_PASSWORD,
    email_confirm: true,
  })
  if (error) throw error
  console.log('Usuário casal criado:', COUPLE_EMAIL)
}

async function main() {
  console.log('Projeto:', url)
  await runSchema()
  await ensureCoupleUser()
  console.log('\n--- Adicione no Vercel ---')
  console.log('VITE_SUPABASE_URL=' + url)
  console.log('VITE_SUPABASE_ANON_KEY=' + (env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  console.log('VITE_COUPLE_EMAIL=' + COUPLE_EMAIL)
  console.log('VITE_COUPLE_PASSWORD=' + COUPLE_PASSWORD)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
