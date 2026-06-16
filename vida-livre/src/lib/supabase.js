import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const coupleEmail = import.meta.env.VITE_COUPLE_EMAIL
const couplePassword = import.meta.env.VITE_COUPLE_PASSWORD

export const isCloudConfigured = Boolean(
  supabaseUrl && supabaseKey && coupleEmail && couplePassword
)

export const supabase = isCloudConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

let authReady = null

export async function ensureCloudAuth() {
  if (!supabase) return false
  if (authReady) return authReady

  authReady = (async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) return true

    const { error } = await supabase.auth.signInWithPassword({
      email: coupleEmail,
      password: couplePassword,
    })
    if (error) throw new Error(`Falha ao conectar na nuvem: ${error.message}`)
    return true
  })()

  try {
    return await authReady
  } catch (err) {
    authReady = null
    throw err
  }
}
