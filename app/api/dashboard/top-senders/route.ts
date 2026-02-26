import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const monthYear = request.nextUrl.searchParams.get('monthYear')
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    if (!monthYear && !startDate) {
      return NextResponse.json({ error: 'monthYear or startDate/endDate required' }, { status: 400 })
    }

    let query = supabase
      .from('skyenergy_feedback')
      .select('from_name')
      .eq('status', 'approved')

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    } else {
      query = query.eq('month_year', monthYear!)
    }

    const { data, error } = await query

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
