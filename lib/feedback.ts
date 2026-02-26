import { supabase } from './supabase'

export async function uploadFeedbackPhoto(file: File): Promise<{ url?: string; error?: string }> {
  try {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { error: `Arquivo muito grande. Máximo: 5MB (seu arquivo: ${(file.size / 1024 / 1024).toFixed(1)}MB)` }
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP' }
    }

    console.log('[dev] Uploading photo via server:', { size: file.size, type: file.type })

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const uploadFileName = `feedback-${timestamp}-${Math.random().toString(36).substring(7)}`

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return { error: 'Configuração de upload não disponível' }
    }

    // Use REST API directly with service role key to bypass RLS
    const uploadUrl = `${supabaseUrl}/storage/v1/object/skyenergy-photos/${uploadFileName}`
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': file.type,
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text()
      console.error('[dev] Storage REST API error:', errorData)
      return { error: `Upload failed: ${uploadResponse.statusText}` }
    }

    const uploadResult = await uploadResponse.json()
    console.log('[dev] Photo uploaded successfully via REST API:', uploadResult)

    // Generate public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/skyenergy-photos/${uploadFileName}`
    console.log('[dev] Public URL generated:', publicUrl)
    
    return { url: publicUrl }
  } catch (err) {
    console.error('[dev] Photo upload exception:', err)
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao enviar foto'
    return { error: errorMessage }
  }
}

export async function submitFeedback(
  fromName: string,
  toName: string,
  categories: string[],
  reason: string | undefined,
  photoUrl: string | undefined,
  sessionId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const monthYear = new Date().toISOString().substring(0, 7) // YYYY-MM format

    const { data, error } = await supabase
      .from('skyenergy_feedback')
      .insert({
        from_name: fromName,
        to_name: toName,
        categories: categories, // Store as JSON array
        reason,
        photo_url: photoUrl,
        status: 'pending',
        month_year: monthYear,
        created_by_session_id: sessionId,
      })
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.[0]?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

const PENDING_PAGE_SIZE = 10

export async function getPendingFeedbacks(
  page = 1
): Promise<{ feedbacks: any[]; total: number; totalPages: number; page: number }> {
  try {
    const from = (page - 1) * PENDING_PAGE_SIZE
    const to = from + PENDING_PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('skyenergy_feedback')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      feedbacks: data || [],
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / PENDING_PAGE_SIZE),
      page,
    }
  } catch (err) {
    console.error('Error fetching pending feedbacks:', err)
    return { feedbacks: [], total: 0, totalPages: 1, page }
  }
}

export async function approveFeedback(
  feedbackId: string,
  hrUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('skyenergy_feedback')
      .update({
        status: 'approved',
        approved_by: hrUserId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

export async function rejectFeedback(
  feedbackId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('skyenergy_feedback')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
      })
      .eq('id', feedbackId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

export async function getMonthlyChampions(
  monthYear: string,
  startDate?: string,
  endDate?: string
): Promise<Record<string, any>> {
  try {
    let query = supabase
      .from('skyenergy_feedback')
      .select('*')
      .eq('status', 'approved')

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    } else {
      query = query.eq('month_year', monthYear)
    }

    const { data, error } = await query

    if (error) {
      console.error('[dev] Error fetching approved feedbacks:', error)
      throw error
    }

    console.log('[dev] Found approved feedbacks:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('[dev] Sample feedback:', JSON.stringify(data[0]))
    }

    const categories = ['Inovação', 'Empatia', 'Confiança', 'Eficiência']
    const champions: Record<string, any> = {}

    for (const category of categories) {
      // Filter feedbacks that have this category in their categories array
      const categoryFeedbacks = data?.filter((f: any) => 
        Array.isArray(f.categories) && f.categories.includes(category)
      ) || []

      console.log(`[dev] Category ${category} feedbacks:`, categoryFeedbacks.length)

      // Count feedbacks for each person
      const personCounts: Record<string, number> = {}
      categoryFeedbacks.forEach((f: any) => {
        personCounts[f.to_name] = (personCounts[f.to_name] || 0) + 1
      })

      console.log(`[dev] Category ${category} person counts:`, personCounts)

      // Find max count
      const maxCount = Math.max(...Object.values(personCounts), 0)

      // Get all people with max count (in case of ties)
      const winners = Object.entries(personCounts)
        .filter(([, count]) => count === maxCount)
        .map(([name]) => name)

      champions[category] = {
        winners: maxCount > 0 ? winners : [],
        count: maxCount,
        feedbacks: categoryFeedbacks.filter((f: any) => winners.includes(f.to_name)),
      }

      console.log(`[dev] Category ${category} champions:`, champions[category])
    }

    console.log('[dev] Final champions result:', champions)
    return champions
  } catch (err) {
    console.error('[dev] Error fetching monthly champions:', err)
    return {}
  }
}

export async function getRandomFeedback(
  monthYear: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  try {
    let query = supabase
      .from('skyenergy_feedback')
      .select('*')
      .eq('status', 'approved')

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    } else {
      query = query.eq('month_year', monthYear)
    }

    const { data, error } = await query

    if (error) throw error

    if (!data || data.length === 0) return null

    const randomIndex = Math.floor(Math.random() * data.length)
    return data[randomIndex]
  } catch (err) {
    console.error('Error fetching random feedback:', err)
    return null
  }
}
