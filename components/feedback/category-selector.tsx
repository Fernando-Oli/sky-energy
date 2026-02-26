'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const CATEGORIES = ['Confiança', 'Eficiência', 'Inovação', 'Empatia']

interface CategorySelectorProps {
  selectedCategories: string[]
  onToggleCategory: (category: string) => void
}

export function CategorySelector({ selectedCategories, onToggleCategory }: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base">
        Categorias <span className="text-destructive">*</span>
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex items-center space-x-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Checkbox
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => onToggleCategory(category)}
            />
            <span className="text-sm">{category}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
