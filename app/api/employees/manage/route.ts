import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET all employees (including inactive)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('id, nome, setor, ativo, created_at')
      .order('nome', { ascending: true })

    if (error) {
      console.error('[dev] Error fetching all employees:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ employees: data || [] })
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

    // Use admin client to bypass RLS
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

    console.log('[dev] PUT request received:', { id, nome, setor, ativo })

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const updates: any = {}
    if (nome !== undefined) updates.nome = nome.trim()
    if (setor !== undefined) updates.setor = setor?.trim() || null
    if (ativo !== undefined) updates.ativo = ativo

    console.log('[dev] Applying updates:', updates)

    // First, check if employee exists
    const { data: existing } = await supabaseAdmin
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()

    console.log('[dev] Existing employee:', existing)

    if (!existing) {
      console.error('[dev] Employee not found')
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
    }

    // Use admin client to update
    const { error: updateError } = await supabaseAdmin
      .from('funcionarios')
      .update(updates)
      .eq('id', id)

    console.log('[dev] Update error:', updateError)

    if (updateError) {
      console.error('[dev] Error updating employee:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Fetch updated employee
    const { data: updated, error: fetchError } = await supabaseAdmin
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()

    console.log('[dev] Updated employee:', updated)

    if (fetchError || !updated) {
      console.error('[dev] Error fetching updated employee:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar funcionário atualizado' }, { status: 500 })
    }

    console.log('[dev] Returning updated employee:', updated)
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

    // Use admin client to bypass RLS
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
