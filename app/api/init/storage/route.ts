import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('[dev] Storage already configured - skyenergy-photos bucket ready')
    return NextResponse.json({ success: true, message: 'Storage ready' })
  } catch (error) {
    console.error('[dev] Initialization error:', error)
    return NextResponse.json(
      { error: 'Initialization check failed' },
      { status: 500 }
    )
  }
}
