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

// O app não usa mais login por email/senha do Supabase Auth — todo acesso é
// via chave anon (RLS liberado para o role anon). `persistSession: false`
// evita salvar sessão nova, e o signOut abaixo limpa qualquer sessão antiga
// que ainda esteja no localStorage (de versões anteriores do app que
// autenticavam via supabase.auth.signInWithPassword) — sem isso, o cliente
// reusa aquele token antigo, que não tem mais política de acesso nenhuma
// (foram trocadas para o role anon), e todo insert/update passa a falhar
// com "row-level security policy" sem nenhum aviso visível na tela.
export const supabase = isCloudConfigured
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

if (supabase) {
  supabase.auth.signOut({ scope: 'local' }).catch(() => {})
}

export async function ensureCloudAuth() {
  return Boolean(supabase)
}
