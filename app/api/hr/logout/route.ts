import { NextRequest, NextResponse } from 'next/server'
import { signOut } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Clear any server-side session
  await signOut()

  const response = NextResponse.json({ success: true })

  // Clear the HTTP-only auth cookie
  response.cookies.set('hr_access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
