import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

export async function POST(request: NextRequest) {
  try {
    let file: File | null = null
    let fileName: string = ''

    try {
      const formData = await request.formData()
      for (const [key, value] of formData) {
        if (key === 'photo' && value instanceof File) {
          file = value
          fileName = value.name
          break
        }
      }
    } catch (formError) {
      console.error('[dev] FormData parsing error:', formError)
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum: 5MB (your file: ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Use JPEG, PNG, GIF or WebP' },
        { status: 400 }
      )
    }

    console.log('[dev] Server-side upload started:', { name: fileName, size: file.size, type: file.type })

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const uploadFileName = `feedback-${timestamp}-${Math.random().toString(36).substring(7)}`

    try {
      // Upload file directly with admin client
      const { data, error } = await supabaseAdmin.storage
        .from('skyenergy-photos')
        .upload(uploadFileName, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        console.error('[dev] Supabase storage error:', error)
        return NextResponse.json(
          { error: `Upload failed: ${error.message}` },
          { status: 500 }
        )
      }

      if (!data) {
        console.error('[dev] Upload returned no data')
        return NextResponse.json(
          { error: 'Upload failed: No data returned' },
          { status: 500 }
        )
      }

      console.log('[dev] Server-side upload successful:', data.path)

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('skyenergy-photos')
        .getPublicUrl(data.path)

      console.log('[dev] Public URL generated')
      return NextResponse.json({ url: urlData.publicUrl })
    } catch (uploadError) {
      console.error('[dev] Upload exception:', uploadError)
      throw uploadError
    }
  } catch (error) {
    console.error('[dev] Upload endpoint error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
