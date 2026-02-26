import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const PAGE_SIZE = 15

// GET all employees with server-side pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('funcionarios')
      .select('id, nome, setor, ativo, created_at', { count: 'exact' })
      .order('nome', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('[dev] Error fetching all employees:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      employees: data || [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    })
  } catch (err) {
    console.error('[dev] Exception fetching all employees:', err)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

// POST - Create new employee
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, setor } = body

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('funcionarios')
      .insert({ nome: nome.trim(), setor: setor?.trim() || null, ativo: true })
      .select()

    if (error) {
      console.error('[dev] Error creating employee:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ employee: data[0] })
  } catch (err) {
    console.error('[dev] Exception creating employee:', err)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

// PUT - Update employee
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, nome, setor, ativo } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const updates: any = {}
    if (nome !== undefined) updates.nome = nome.trim()
    if (setor !== undefined) updates.setor = setor?.trim() || null
    if (ativo !== undefined) updates.ativo = ativo

    const { data: existing } = await supabaseAdmin
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('funcionarios')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('[dev] Error updating employee:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { data: updated, error: fetchError } = await supabaseAdmin
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !updated) {
      return NextResponse.json({ error: 'Erro ao buscar funcionário atualizado' }, { status: 500 })
    }

    return NextResponse.json({ employee: updated, success: true })
  } catch (err) {
    console.error('[dev] Exception updating employee:', err)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

// DELETE - Soft delete (set ativo = false)
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('funcionarios')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      console.error('[dev] Error deleting employee:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[dev] Exception deleting employee:', err)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
