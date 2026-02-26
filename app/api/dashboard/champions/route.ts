import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyChampions } from '@/lib/feedback'

export async function GET(request: NextRequest) {
  try {
    const monthYear = request.nextUrl.searchParams.get('monthYear')

    if (!monthYear) {
      return NextResponse.json(
        { error: 'monthYear parameter required' },
        { status: 400 }
      )
    }

    const champions = await getMonthlyChampions(monthYear)

    return NextResponse.json({ champions })
  } catch (error) {
    console.error('Error fetching champions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
