import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - List all bugs
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[dev] Error fetching bugs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bugs: data || [] })
  } catch (err) {
    console.error('[dev] Exception fetching bugs:', err)
    return NextResponse.json({ error: 'Failed to fetch bugs' }, { status: 500 })
  }
}

// POST - Create new bug report
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { titulo, descricao, pagina } = body

    if (!titulo || !descricao || !pagina) {
      return NextResponse.json(
        { error: 'Título, descrição e página são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('bugs')
      .insert({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        pagina: pagina.trim(),
        status: 'pendente',
        prioridade: 'media'
      })
      .select()
      .single()

    if (error) {
      console.error('[dev] Error creating bug:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bug: data })
  } catch (err) {
    console.error('[dev] Exception creating bug:', err)
    return NextResponse.json({ error: 'Failed to create bug' }, { status: 500 })
  }
}

// PUT - Update bug status
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, prioridade } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const updates: any = {}
    if (status) updates.status = status
    if (prioridade) updates.prioridade = prioridade

    const { data, error } = await supabaseAdmin
      .from('bugs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[dev] Error updating bug:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bug: data })
  } catch (err) {
    console.error('[dev] Exception updating bug:', err)
    return NextResponse.json({ error: 'Failed to update bug' }, { status: 500 })
  }
}
