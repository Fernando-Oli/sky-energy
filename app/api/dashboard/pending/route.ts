import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const monthYear = request.nextUrl.searchParams.get('monthYear')

    if (!monthYear) {
      return NextResponse.json(
        { error: 'monthYear parameter required' },
        { status: 400 }
      )
    }

    // Get pending feedbacks with employee setor information
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('skyenergy_feedback')
      .select(`
        *,
        from_employee:funcionarios!from_name(nome, setor),
        to_employee:funcionarios!to_name(nome, setor)
      `)
      .in('status', ['pending', 'approved'])
      .eq('month_year', monthYear)
      .order('created_at', { ascending: false })

    if (feedbackError) {
      console.error('[dev] Error fetching feedbacks:', feedbackError)
      throw feedbackError
    }

    // Get all funcionarios for mapping setor
    const { data: funcionarios } = await supabase
      .from('funcionarios')
      .select('nome, setor')

    const setorMap = new Map(funcionarios?.map((f) => [f.nome, f.setor]) || [])

    // Enrich feedbacks with setor information
    const enrichedData = (feedbackData || []).map((feedback) => ({
      ...feedback,
      from_setor: setorMap.get(feedback.from_name),
      to_setor: setorMap.get(feedback.to_name),
    }))

    return NextResponse.json(enrichedData)
  } catch (error) {
    console.error('Error fetching pending feedbacks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
