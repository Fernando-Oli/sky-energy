import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const month = searchParams.get('month')

    let query = supabase
      .from('skyenergy_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (month) {
      query = query.eq('month_year', month)
    }

    const { data, error } = await query

    if (error) {
      console.error('[dev] Error fetching feedbacks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedbacks: data || [] })
  } catch (err) {
    console.error('[dev] Exception fetching feedbacks:', err)
    return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 })
  }
}
