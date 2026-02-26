import { NextRequest, NextResponse } from 'next/server'
import { approveFeedback, rejectFeedback, getPendingFeedbacks } from '@/lib/feedback'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication via cookie token
    const token = request.cookies.get('hr_access_token')?.value
    const userResult = await getCurrentUser(token)

    if (!userResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feedbackId, action, rejectionReason } = await request.json()

    if (!feedbackId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    if (action === 'approve') {
      result = await approveFeedback(feedbackId, userResult.user?.id)
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason required' },
          { status: 400 }
        )
      }
      result = await rejectFeedback(feedbackId, rejectionReason)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[dev] Error in feedback validation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication via cookie token
    const token = request.cookies.get('hr_access_token')?.value
    const userResult = await getCurrentUser(token)

    if (!userResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedbacks = await getPendingFeedbacks()

    return NextResponse.json({ feedbacks })
  } catch (error) {
    console.error('[dev] Error fetching pending feedbacks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
