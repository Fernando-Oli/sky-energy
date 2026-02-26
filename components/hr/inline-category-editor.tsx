'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil, Check, X } from 'lucide-react'

const CATEGORIES = ['Inovação', 'Empatia', 'Confiança', 'Eficiência']

interface InlineCategoryEditorProps {
  feedbackId: string
  currentCategories: string[]
  categoryColors: Record<string, string>
  onUpdate: (feedbackId: string, categories: string[]) => Promise<void>
}

export function InlineCategoryEditor({
  feedbackId,
  currentCategories,
  categoryColors,
  onUpdate,
}: InlineCategoryEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Não permitir remover se for a última categoria
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== category))
      }
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleSave = async () => {
    if (selectedCategories.length === 0) return
    
    setIsSaving(true)
    try {
      await onUpdate(feedbackId, selectedCategories)
      setIsEditing(false)
    } catch (error) {
      console.error('[v0] Error updating categories:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedCategories(currentCategories)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-md cursor-pointer transition-colors ${
                selectedCategories.includes(category)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent'
              }`}
            >
              <Checkbox
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleToggleCategory(category)}
                disabled={selectedCategories.length === 1 && selectedCategories.includes(category)}
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || selectedCategories.length === 0}
          >
            <Check className="w-3 h-3 mr-1" />
            Salvar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-3 h-3 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {currentCategories.map((cat: string) => (
        <Badge key={cat} className={categoryColors[cat]}>
          {cat}
        </Badge>
      ))}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 px-2"
      >
        <Pencil className="w-3 h-3" />
      </Button>
    </div>
  )
}
