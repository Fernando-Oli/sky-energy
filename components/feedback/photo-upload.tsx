'use client'

import React, { useState, useRef } from "react"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoUploadProps {
  photoPreview: string
  photoSizeWarning: string
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhotoFromWebcam: (file: File) => void
  onRemovePhoto: () => void
}

export function PhotoUpload({ 
  photoPreview, 
  photoSizeWarning, 
  onPhotoChange,
  onPhotoFromWebcam,
  onRemovePhoto 
}: PhotoUploadProps) {
  const [showWebcam, setShowWebcam] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setStream(mediaStream)
      setShowWebcam(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('[dev] Error accessing webcam:', error)
      toast.error('Não foi possível acessar a câmera')
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowWebcam(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
          onPhotoFromWebcam(file)
          stopWebcam()
        }
      }, 'image/jpeg', 0.95)
    }
  }

  if (showWebcam) {
    return (
      <div className="space-y-2">
        <Label className="text-base">
          Webcam <span className="text-destructive">*</span>
        </Label>
        <div className="border-2 border-border rounded-lg p-4 space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={capturePhoto} className="flex-1">
              📸 Capturar Foto
            </Button>
            <Button type="button" variant="outline" onClick={stopWebcam}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-base">
        Foto do Feedback <span className="text-destructive">*</span>
      </Label>
      
      {!photoPreview ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhotoChange}
              className="hidden"
              id="camera-input"
            />
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
              id="gallery-input"
              required
            />
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-transparent" 
              onClick={() => document.getElementById('camera-input')?.click()}
            >
              📷 Câmera
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-transparent" 
              onClick={startWebcam}
            >
              💻 Webcam
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-transparent col-span-2" 
              onClick={() => document.getElementById('gallery-input')?.click()}
            >
              🖼️ Selecionar da Galeria
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Tire uma foto ou selecione da galeria
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <img
              src={photoPreview || "/placeholder.svg"}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg mx-auto"
            />
            <p className="text-sm text-muted-foreground mt-3">Foto selecionada</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhotoChange}
              className="hidden"
              id="camera-input-change"
            />
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
              id="gallery-input-change"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="bg-transparent" 
              onClick={() => document.getElementById('camera-input-change')?.click()}
            >
              📷
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="bg-transparent" 
              onClick={startWebcam}
            >
              💻
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 bg-transparent" 
              onClick={() => document.getElementById('gallery-input-change')?.click()}
            >
              🖼️ Galeria
            </Button>
            <Button type="button" variant="ghost" onClick={onRemovePhoto}>
              ✕
            </Button>
          </div>
        </div>
      )}
      
      {photoSizeWarning && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{photoSizeWarning}</p>
        </div>
      )}
    </div>
  )
}
