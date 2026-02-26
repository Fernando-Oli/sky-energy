import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const hrSessionCookie = cookieStore.get('hr-session')

    if (!hrSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feedbackId, categories } = await request.json()

    if (!feedbackId || !categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'feedbackId e categories são obrigatórios e categories deve ter pelo menos 1 item' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update categories in the database
    const { data, error } = await supabase
      .from('feedbacks')
      .update({ categories })
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating categories:', error)
      return NextResponse.json({ error: 'Erro ao atualizar categorias' }, { status: 500 })
    }

    return NextResponse.json({ success: true, feedback: data })
  } catch (error) {
    console.error('[v0] Error in update-categories route:', error)
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 })
  }
}
