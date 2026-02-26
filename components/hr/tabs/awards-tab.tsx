'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send } from 'lucide-react'

interface Champion {
  winners: string[]
  count: number
}

interface AwardsTabProps {
  champions: Record<string, Champion>
  categoryColors: Record<string, string>
  selectedMonth: string
  availableMonths: string[]
  randomFeedback: any
  isDrawing: boolean
  showWinner: boolean
  topSenders: { from_name: string; count: number }[]
  onMonthChange: (month: string) => void
  onDraw: () => void
}

export function AwardsTab({
  champions,
  categoryColors,
  selectedMonth,
  availableMonths,
  randomFeedback,
  isDrawing,
  showWinner,
  topSenders,
  onMonthChange,
  onDraw,
}: AwardsTabProps) {
  return (
    <div className="space-y-8">
      {/* Champions Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Campeões do Mês</h2>
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

          {/* Mais Envios card — same visual pattern as category cards */}
          {topSenders.length > 0 && (
            <Card className="p-6">
              <div className="mb-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1.5 w-fit">
                  <Send className="w-3 h-3" />
                  Mais Envios
                </Badge>
              </div>
              <div className="space-y-3">
                {topSenders.slice(0, 3).map((sender, index) => {
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <div key={sender.from_name} className="flex items-baseline justify-between">
                      <p className="text-xl font-bold text-foreground flex items-center gap-2">
                        <span className="text-base">{medals[index]}</span>
                        {sender.from_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-primary">{sender.count}</p>
                        <p className="text-sm text-muted-foreground">enviados</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Random Draw Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Sorteio do Mês</h2>
        <Card className="p-8">
          {showWinner && randomFeedback ? (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Image Section */}
              {randomFeedback.photo_url && (
                <div className="flex-shrink-0">
                  <img
                    src={randomFeedback.photo_url || "/placeholder.svg"}
                    alt="Feedback do sorteado"
                    className="w-64 h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-4 border-primary/20"
                    onClick={() => {
                      const fullscreenImg = document.createElement('div')
                      fullscreenImg.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer'
                      fullscreenImg.onclick = () => fullscreenImg.remove()
                      const img = document.createElement('img')
                      img.src = randomFeedback.photo_url
                      img.className = 'max-w-[90vw] max-h-[90vh] object-contain'
                      fullscreenImg.appendChild(img)
                      document.body.appendChild(fullscreenImg)
                    }}
                  />
                </div>
              )}
              
              {/* Winner Info Section */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <p className="text-sm text-muted-foreground mb-2">Feliz sortudo(a) do mês:</p>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-4">
                  <p className="text-3xl font-bold text-primary">{randomFeedback.to_name}</p>
                  {randomFeedback.to_setor && (
                    <p className="text-sm text-muted-foreground mt-2">{randomFeedback.to_setor}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {randomFeedback.categories && randomFeedback.categories.map((cat: string) => (
                    <Badge key={cat} className="bg-primary/20 text-primary">{cat}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Reconhecido por: <span className="font-semibold text-foreground">{randomFeedback.from_name}</span>
                </p>
                {randomFeedback.reason && (
                  <p className="text-xs text-muted-foreground italic">"{randomFeedback.reason}"</p>
                )}
                <Button onClick={onDraw} variant="outline" className="mt-4 bg-transparent">
                  Sortear Novamente 🎲
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground mb-4">Clique no botão para realizar o sorteio</p>
              <Button onClick={onDraw} disabled={isDrawing} size="lg">
                {isDrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sorteando...
                  </>
                ) : (
                  'Realizar Sorteio 🎲'
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
