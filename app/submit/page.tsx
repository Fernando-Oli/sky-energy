'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Upload, Loader2, Check, AlertCircle } from 'lucide-react'
import { InfoBanner } from '@/components/feedback/info-banner'
import { BugReportButton } from '@/components/bug-report-button'

const CATEGORIES = ['Confiança', 'Eficiência', 'Inovação', 'Empatia']

export default function SubmitPage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [fromName, setFromName] = useState('')
  const [toName, setToName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [photoSizeWarning, setPhotoSizeWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([])
  const [toSuggestions, setToSuggestions] = useState<any[]>([])
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  useEffect(() => {
    // Generate or retrieve session ID
    let id = sessionStorage.getItem('sessionId')
    if (!id) {
      id = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
      sessionStorage.setItem('sessionId', id)
    }
    setSessionId(id)

    // Fetch employees list
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (response.ok) {
          const data = await response.json()
          // Store full employee objects with setor
          setEmployees(data.employees || [])
          console.log('[dev] Loaded employees:', data.employees?.length)
        }
      } catch (error) {
        console.warn('[dev] Failed to load employees:', error)
      }
    }

    // Initialize storage on first load
    const initStorage = async () => {
      try {
        console.log('[dev] Initializing storage...')
        const response = await fetch('/api/init/storage', { method: 'POST' })
        if (!response.ok) {
          console.warn('[dev] Storage initialization warning:', response.statusText)
        } else {
          console.log('[dev] Storage initialized')
        }
      } catch (error) {
        console.warn('[dev] Storage init error:', error)
      }
    }

    fetchEmployees()
    initStorage()
  }, [])

  const handleFromNameChange = (value: string) => {
    setFromName(value)
    if (value.length > 0) {
      const filtered = employees
        .filter(emp => emp.nome.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
      setFromSuggestions(filtered)
      setShowFromSuggestions(true)
    } else {
      setShowFromSuggestions(false)
    }
  }

  const handleToNameChange = (value: string) => {
    setToName(value)
    if (value.length > 0) {
      const filtered = employees
        .filter(emp => emp.nome.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
      setToSuggestions(filtered)
      setShowToSuggestions(true)
    } else {
      setShowToSuggestions(false)
    }
  }

  const selectFromName = (employee: any) => {
    setFromName(employee.nome)
    setShowFromSuggestions(false)
  }

  const selectToName = (employee: any) => {
    setToName(employee.nome)
    setShowToSuggestions(false)
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve(file)
            return
          }

          // Define max dimensions (1920x1920 para boa qualidade)
          const maxWidth = 1080
          const maxHeight = 1080
          let width = img.width
          let height = img.height

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to WebP with quality 0.85
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                  type: 'image/webp',
                  lastModified: Date.now(),
                })
                console.log('[dev] Image compressed:', {
                  original: `${(file.size / 1024).toFixed(0)}KB`,
                  compressed: `${(compressedFile.size / 1024).toFixed(0)}KB`,
                  reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(0)}%`
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/webp',
            0.85
          )
        }
        img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      }
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    })
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP')
        return
      }

      // Show loading state
      setPhotoSizeWarning('Processando imagem...')

      try {
        // Compress and convert image
        const compressedFile = await compressImage(file)
        const fileSizeMB = compressedFile.size / 1024 / 1024

        // Validate compressed file size (5MB max)
        const maxSize = 5 * 1024 * 1024
        if (compressedFile.size > maxSize) {
          toast.error(`Imagem muito grande mesmo após compressão. Máximo: 5MB (${fileSizeMB.toFixed(1)}MB)`)
          setPhotoSizeWarning(`Arquivo muito grande (${fileSizeMB.toFixed(1)}MB). Máximo: 5MB`)
          return
        }

        // Show success message
        if (file.size > compressedFile.size) {
          setPhotoSizeWarning(`✓ Imagem otimizada: ${(compressedFile.size / 1024).toFixed(0)}KB (economia de ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(0)}%)`)
        } else {
          setPhotoSizeWarning('')
        }

        setPhoto(compressedFile)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPhotoPreview(e.target?.result as string)
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('[dev] Error compressing image:', error)
        toast.error('Erro ao processar imagem. Tente outra foto.')
        setPhotoSizeWarning('')
      }
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmissionError('')

    // Validações com mensagens claras
    const errors: string[] = []
    
    if (!fromName.trim()) {
      errors.push('Seu nome é obrigatório')
    }

    if (!toName.trim()) {
      errors.push('Nome da pessoa reconhecida é obrigatório')
    }

    if (!photo) {
      errors.push('Foto do feedback é obrigatória')
    }

    if (selectedCategories.length === 0) {
      errors.push('Selecione pelo menos uma categoria')
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('. ')
      setSubmissionError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setLoading(true)

    try {
      // Submit all categories in a single feedback
      const formData = new FormData()
      formData.append('fromName', fromName)
      formData.append('toName', toName)
      formData.append('categories', JSON.stringify(selectedCategories))
      if (reason.trim()) {
        formData.append('reason', reason)
      }
      if (photo) {
        formData.append('photo', photo)
      }
      formData.append('sessionId', sessionId)

      console.log('[v0] Submitting feedback with categories:', selectedCategories)

      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      })

      console.log('[v0] Response status:', response.status)

      let errorData
      try {
        errorData = await response.json()
        console.log('[v0] Response data:', errorData)
      } catch (e) {
        const text = await response.text()
        console.error('[v0] Non-JSON response:', text.substring(0, 200))
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMsg = errorData.error || 'Erro ao enviar feedback'
        console.log('[v0] Request failed with error:', errorMsg)
        setSubmissionError(errorMsg)
        throw new Error(errorMsg)
      }

      console.log('[v0] Feedback submitted successfully!')
      toast.success('Feedback enviado com sucesso!')
      setSubmitted(true)
      setSubmissionError('')

      // Reset form
      setTimeout(() => {
        setFromName('')
        setToName('')
        setSelectedCategories([])
        setReason('')
        setPhoto(null)
        setPhotoPreview('')
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('[v0] Error submitting feedback:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro ao enviar feedback'
      console.log('[v0] Error message:', errorMsg)
      setSubmissionError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sucesso!</h2>
          <p className="text-muted-foreground mb-4">Seu feedback foi enviado para validação</p>
          <Button onClick={() => window.location.reload()}>Enviar outro feedback</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">SkyEnergy</h1>
          <p className="text-muted-foreground">Reconheça e valorize seus colegas</p>
        </div>

        <InfoBanner />

        <Card className="p-8 mt-6">
          {submissionError && (
            <div className="mb-6 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">Erro ao enviar feedback</p>
                <p className="text-sm text-destructive/90">{submissionError}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Name */}
            <div className="space-y-2 relative">
              <Label htmlFor="fromName" className="text-base">
                De:
              </Label>
              <Input
                id="fromName"
                placeholder="Digite seu nome"
                value={fromName}
                onChange={(e) => handleFromNameChange(e.target.value)}
                onFocus={() => fromName && setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                className="h-10"
                required
                autoComplete="off"
              />
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                  {fromSuggestions.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => selectFromName(emp)}
                      className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="font-medium">{emp.nome}</div>
                      {emp.setor && <div className="text-xs text-muted-foreground">{emp.setor}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* To Name */}
            <div className="space-y-2 relative">
              <Label htmlFor="toName" className="text-base">
                Para:
              </Label>
              <Input
                id="toName"
                placeholder="Digite o nome da pessoa"
                value={toName}
                onChange={(e) => handleToNameChange(e.target.value)}
                onFocus={() => toName && setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                className="h-10"
                required
                autoComplete="off"
              />
              {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                  {toSuggestions.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => selectToName(emp)}
                      className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="font-medium">{emp.nome}</div>
                      {emp.setor && <div className="text-xs text-muted-foreground">{emp.setor}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-base">Foto do Feedback <span className="text-destructive">*</span></Label>
              
              {!photoPreview ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="camera-input"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="gallery-input"
                    />
                    <label htmlFor="camera-input" className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => document.getElementById('camera-input')?.click()}>
                        📷 Usar Câmera
                      </Button>
                    </label>
                    <label htmlFor="gallery-input" className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => document.getElementById('gallery-input')?.click()}>
                        🖼️ Galeria
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Escolha entre tirar uma foto ou selecionar da galeria</p>
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
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="camera-input-change"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="gallery-input-change"
                    />
                    <label htmlFor="camera-input-change" className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => document.getElementById('camera-input-change')?.click()}>
                        Câmera
                      </Button>
                    </label>
                    <label htmlFor="gallery-input-change" className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => document.getElementById('gallery-input-change')?.click()}>
                        Galeria
                      </Button>
                    </label>
                    <Button type="button" variant="ghost" onClick={() => {
                      setPhoto(null)
                      setPhotoPreview('')
                      setPhotoSizeWarning('')
                    }}>
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

            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-base">
                Categorias <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">Selecione pelo menos uma categoria</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <label
                      htmlFor={category}
                      className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-base">
                Por que (opcional)
              </Label>
              <Textarea
                id="reason"
                placeholder="Explique sua justificativa (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Validation Error Display */}
            {submissionError && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Campos obrigatorios:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{submissionError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Feedback'
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Seu feedback será revisado pelo RH antes de ser processado
          </p>
        </div>
      </div>

      <BugReportButton />
    </div>
  )
}
