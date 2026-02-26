'use client'

import { Card } from '@/components/ui/card'

interface DashboardStatsProps {
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

export function DashboardStats({ pendingCount, approvedCount, rejectedCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-6">
        <p className="text-muted-foreground text-sm mb-1">Pendentes</p>
        <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
      </Card>
      <Card className="p-6">
        <p className="text-muted-foreground text-sm mb-1">Aprovados</p>
        <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
      </Card>
      <Card className="p-6">
        <p className="text-muted-foreground text-sm mb-1">Rejeitados</p>
        <p className="text-3xl font-bold text-destructive">{rejectedCount}</p>
      </Card>
    </div>
  )
}
