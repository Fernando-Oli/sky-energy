'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Employee {
  id: string
  nome: string
  setor?: string
}

interface EmployeeAutocompleteProps {
  label: string
  value: string
  suggestions: Employee[]
  showSuggestions: boolean
  onChange: (value: string) => void
  onSelect: (employee: Employee) => void
  required?: boolean
}

export function EmployeeAutocomplete({
  label,
  value,
  suggestions,
  showSuggestions,
  onChange,
  onSelect,
  required = false
}: EmployeeAutocompleteProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Input
          placeholder={`Digite o nome...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-border rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
            {suggestions.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => onSelect(emp)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="font-medium">{emp.nome}</div>
                {emp.setor && <div className="text-xs text-muted-foreground">{emp.setor}</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
