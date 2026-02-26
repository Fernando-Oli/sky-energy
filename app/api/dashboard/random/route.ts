import { NextRequest, NextResponse } from 'next/server'
import { getRandomFeedback } from '@/lib/feedback'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const monthYear = searchParams.get('monthYear') || new Date().toISOString().substring(0, 7)

    const feedback = await getRandomFeedback(monthYear)

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('[dev] Error fetching random feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
