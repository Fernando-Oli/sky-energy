import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

// Admin client for sensitive operations (server-side only)
export const supabaseAdmin = supabaseServiceKey
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null

// Export a function to create a new client instance (no session persistence)
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}

export type SkyEnergyFeedback = {
  id: string
  from_name: string
  to_name: string
  category: 'Inovação' | 'Empatia' | 'Confiança' | 'Eficiência'
  reason?: string
  photo_url?: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  approved_at?: string
  approved_by?: string
  month_year: string
  created_by_session_id?: string
}

export type HRUser = {
  id: string
  email: string
  name: string
  created_at: string
  is_active: boolean
}

export type Session = {
  id: string
  hr_user_id: string
  token: string
  expires_at: string
  created_at: string
}
