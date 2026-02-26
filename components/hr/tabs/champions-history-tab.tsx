'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Champion {
  winners: string[]
  count: number
}

interface ChampionsHistoryTabProps {
  champions: Record<string, Champion>
  categoryColors: Record<string, string>
  selectedMonth: string
  availableMonths: string[]
  onMonthChange: (month: string) => void
}

export function ChampionsHistoryTab({
  champions,
  categoryColors,
  selectedMonth,
  availableMonths,
  onMonthChange,
}: ChampionsHistoryTabProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Histórico de Campeões</h2>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          {availableMonths.map((month) => {
            const [year, monthNum] = month.split('-')
            const date = new Date(parseInt(year), parseInt(monthNum) - 1)
            const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            return (
              <option key={month} value={month}>
                {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
              </option>
            )
          })}
        </select>
      </div>
      
      <p className="text-muted-foreground mb-4 text-sm">Pessoas que mais receberam feedbacks em cada categoria</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(champions).map(([category, champion]: [string, any]) => (
          <Card key={category} className="p-6">
            <div className="mb-4">
              <Badge className={categoryColors[category]}>{category}</Badge>
            </div>
            {champion?.winners && champion.winners.length > 0 ? (
              <div className="space-y-3">
                {champion.winners.map((winner: string) => (
                  <div key={winner} className="flex items-baseline justify-between">
                    <p className="text-xl font-bold text-foreground">{winner}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-primary">{champion?.count || 0}</p>
                      <p className="text-sm text-muted-foreground">feedbacks</p>
                    </div>
                  </div>
                ))}
                {champion.winners.length > 1 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-3 pt-3 border-t border-border">
                    Empate! Ambos ganham o prêmio desta categoria
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Nenhum feedback aprovado ainda nesta categoria</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
