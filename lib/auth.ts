import { supabase, createClient } from './supabase'

export async function signInHR(email: string, password: string): Promise<{ success: boolean; user?: any; session?: any; error?: string }> {
  try {
    // Use a fresh client to avoid polluting the global singleton session state
    const freshClient = createClient()

    const { data, error } = await freshClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Failed to authenticate' }
    }

    return { success: true, user: data.user, session: data.session }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

export async function getCurrentUser(accessToken?: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    if (!accessToken) {
      return { success: false, error: 'No access token provided' }
    }

    const { supabaseAdmin } = await import('./supabase')
    const client = supabaseAdmin || supabase
    const { data, error } = await client.auth.getUser(accessToken)

    if (error || !data.user) {
      return { success: false, error: 'Invalid or expired token' }
    }

    return { success: true, user: data.user }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}
