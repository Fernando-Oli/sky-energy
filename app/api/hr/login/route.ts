import { NextRequest, NextResponse } from 'next/server'
import { signInHR } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const result = await signInHR(email, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
    })

    // Store access token in HTTP-only cookie so it's tied to this browser session
    response.cookies.set('hr_access_token', result.session?.access_token ?? '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[dev] Login error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    )
  }
}
