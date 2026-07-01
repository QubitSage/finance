import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY

export const isCloudConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase = isCloudConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Acesso direto via chave anon (RLS liberado para o role anon) — sem login,
// nem em segundo plano. Mantida apenas para compatibilidade de chamada.
export async function ensureCloudAuth() {
  return Boolean(supabase)
}
