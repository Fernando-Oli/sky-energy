import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 10

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('skyenergy_feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)
    if (month) query = query.eq('month_year', month)

    const { data, error, count } = await query

    if (error) {
      console.error('[dev] Error fetching feedbacks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      feedbacks: data || [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    })
  } catch (err) {
    console.error('[dev] Exception fetching feedbacks:', err)
    return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 })
  }
}
