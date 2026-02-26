'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

interface Sender {
  from_name: string
  count: number
}

interface TopSendersProps {
  senders: Sender[]
  selectedMonth: string
}

export function TopSenders({ senders, selectedMonth }: TopSendersProps) {
  const [year, month] = selectedMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const monthFormatted = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  if (senders.length === 0) return null

  const medals = ['text-yellow-500', 'text-slate-400', 'text-amber-700']

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Quem mais enviou feedbacks</h2>
      <p className="text-sm text-muted-foreground mb-6">{monthFormatted}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {senders.map((sender, index) => (
          <Card key={sender.from_name} className="p-5 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              {index < 3 ? (
                <Trophy className={`w-6 h-6 ${medals[index]}`} />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{sender.from_name}</p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0 text-base font-bold px-3 py-1">
              {sender.count}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  )
}
