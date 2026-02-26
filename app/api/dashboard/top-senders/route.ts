import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const monthYear = request.nextUrl.searchParams.get('monthYear')

    if (!monthYear) {
      return NextResponse.json({ error: 'monthYear parameter required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('skyenergy_feedback')
      .select('from_name')
      .eq('status', 'approved')
      .eq('month_year', monthYear)

    if (error) throw error

    // Aggregate by from_name
    const counts: Record<string, { from_name: string; count: number }> = {}
    for (const row of data || []) {
      if (!counts[row.from_name]) {
        counts[row.from_name] = { from_name: row.from_name, count: 0 }
      }
      counts[row.from_name].count++
    }

    const senders = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({ senders })
  } catch (error) {
    console.error('Error fetching top senders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
