'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import type { TabId } from '@/hooks/use-dashboard'

interface DashboardHeaderProps {
  userEmail?: string
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onLogout: () => void
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'pending', label: 'Pendentes' },
  { id: 'history', label: 'Histórico' },
  { id: 'awards', label: 'Premiação' },
  { id: 'employees', label: 'Gerenciar Funcionários' },
  { id: 'bugs', label: 'Bugs Reportados' },
]

export function DashboardHeader({ userEmail, activeTab, onTabChange, onLogout }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Validação de Feedbacks</h1>
          {userEmail && <p className="text-muted-foreground mt-1">Olá, {userEmail}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
