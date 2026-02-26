import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('id, nome, setor')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      console.error('[dev] Error fetching employees:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ employees: data || [] })
  } catch (err) {
      console.error('[dev] Exception fetching employees:', err)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}
