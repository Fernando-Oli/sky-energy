import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication via cookie token
    const token = request.cookies.get('hr_access_token')?.value
    const userResult = await getCurrentUser(token)

    if (!userResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get approved count
    const { count: approvedCount } = await supabase
      .from('skyenergy_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    // Get rejected count
    const { count: rejectedCount } = await supabase
      .from('skyenergy_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    return NextResponse.json({
      stats: {
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
      },
    })
  } catch (error) {
    console.error('[dev] Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
