import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('hr_access_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const result = await getCurrentUser(token)

    if (!result.success) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
    })
  } catch (error) {
    console.error('[dev] Error verifying user:', error)
    return NextResponse.json({ authenticated: false })
  }
}
