import { NextRequest, NextResponse } from 'next/server'
import { submitFeedback, uploadFeedbackPhoto } from '@/lib/feedback'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    let formData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error('[dev] Error parsing form data:', parseError)
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const fromName = formData.get('fromName') as string
    const toName = formData.get('toName') as string
    const categoriesJson = formData.get('categories') as string
    const reason = (formData.get('reason') as string) || undefined
    const file = formData.get('photo') as File | null
    const sessionId = formData.get('sessionId') as string

    let categories: string[] = []
    try {
      categories = JSON.parse(categoriesJson)
    } catch {
      console.error('[dev] Invalid categories JSON:', categoriesJson)
      return NextResponse.json(
        { error: 'Invalid categories format' },
        { status: 400 }
      )
    }

    console.log('[dev] Feedback submission:', { fromName, toName, categories, sessionId, hasFile: !!file })

    if (!fromName || !toName || categories.length === 0 || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that both employees exist and are active
    console.log('[dev] Validating employees exist:', { fromName, toName })
    
    const { data: fromEmployee } = await supabase
      .from('funcionarios')
      .select('id, nome, ativo')
      .eq('nome', fromName)
      .eq('ativo', true)
      .maybeSingle()

    const { data: toEmployee } = await supabase
      .from('funcionarios')
      .select('id, nome, ativo')
      .eq('nome', toName)
      .eq('ativo', true)
      .maybeSingle()

    if (!fromEmployee) {
      console.error('[dev] From employee not found or inactive:', fromName)
      return NextResponse.json(
        { error: `Funcionário "${fromName}" não encontrado ou inativo` },
        { status: 400 }
      )
    }

    if (!toEmployee) {
      console.error('[dev] To employee not found or inactive:', toName)
      return NextResponse.json(
        { error: `Funcionário "${toName}" não encontrado ou inativo` },
        { status: 400 }
      )
    }

    console.log('[dev] Both employees validated successfully')

    let photoUrl: string | undefined

    if (file) {
      console.log('[dev] Uploading photo:', file.name, file.type, file.size)
      const uploadResult = await uploadFeedbackPhoto(file)
      if (uploadResult.error) {
        console.error('[dev] Photo upload error:', uploadResult.error)
        return NextResponse.json({ error: uploadResult.error }, { status: 400 })
      }
      photoUrl = uploadResult.url
      console.log('[dev] Photo uploaded successfully:', photoUrl)
    }

    console.log('[dev] Submitting feedback to database')
    const result = await submitFeedback(fromName, toName, categories, reason, photoUrl, sessionId)

    if (!result.success) {
      console.error('[dev] Feedback submission error:', result.error)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    console.log('[dev] Feedback submitted successfully:', result.id)
    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('[dev] Error in feedback submission:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
