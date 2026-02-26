import { NextResponse } from 'next/server'

export async function GET() {
  const env = {
    supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  }

  console.log('[dev] Environment check:', env)

  return NextResponse.json({ success: true, ...env })
}
