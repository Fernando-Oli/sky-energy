import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyChampions } from '@/lib/feedback'

export async function GET(request: NextRequest) {
  try {
    const monthYear = request.nextUrl.searchParams.get('monthYear')
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    if (!monthYear && !startDate) {
      return NextResponse.json(
        { error: 'monthYear or startDate/endDate required' },
        { status: 400 }
      )
    }

    const champions = await getMonthlyChampions(
      monthYear || '',
      startDate || undefined,
      endDate || undefined
    )

    return NextResponse.json({ champions })
  } catch (error) {
    console.error('Error fetching champions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
