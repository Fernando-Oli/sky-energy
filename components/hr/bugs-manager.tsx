'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bug, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BugReport {
  id: string
  titulo: string
  descricao: string
  pagina: string
  status: 'pendente' | 'em_andamento' | 'concluido' | 'rejeitado'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  created_at: string
  updated_at: string
}

const STATUS_LABELS = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  rejeitado: 'Rejeitado'
}

const STATUS_ICONS = {
  pendente: Clock,
  em_andamento: AlertCircle,
  concluido: CheckCircle,
  rejeitado: XCircle
}

const PRIORIDADE_LABELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica'
}

const PRIORIDADE_COLORS = {
  baixa: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  media: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  critica: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
}

export function BugsManager() {
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchBugs()
  }, [])

  const fetchBugs = async () => {
    try {
      const response = await fetch('/api/bugs')
      if (response.ok) {
        const data = await response.json()
        setBugs(data.bugs || [])
      }
    } catch (error) {
      console.error('[dev] Error fetching bugs:', error)
      toast.error('Erro ao carregar bugs')
    } finally {
      setLoading(false)
    }
  }

  const updateBugStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/bugs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        toast.success('Status atualizado')
        fetchBugs()
      } else {
        toast.error('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('[dev] Error updating bug:', error)
      toast.error('Erro ao atualizar bug')
    }
  }

  const updateBugPriority = async (id: string, prioridade: string) => {
    try {
      const response = await fetch('/api/bugs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, prioridade })
      })

      if (response.ok) {
        toast.success('Prioridade atualizada')
        fetchBugs()
      } else {
        toast.error('Erro ao atualizar prioridade')
      }
    } catch (error) {
      console.error('[dev] Error updating bug priority:', error)
      toast.error('Erro ao atualizar prioridade')
    }
  }

  const filteredBugs = bugs.filter(bug => {
    if (filter === 'all') return true
    if (filter === 'reportados') return bug.status === 'pendente'
    return bug.status === filter
  })

  const stats = {
    reportados: bugs.filter(b => b.status === 'pendente').length,
    em_andamento: bugs.filter(b => b.status === 'em_andamento').length,
    concluido: bugs.filter(b => b.status === 'concluido').length,
    rejeitado: bugs.filter(b => b.status === 'rejeitado').length
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Carregando bugs...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter('reportados')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reportados</p>
              <p className="text-2xl font-bold">{stats.reportados}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter('em_andamento')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.em_andamento}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter('concluido')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">{stats.concluido}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter('rejeitado')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejeitados</p>
              <p className="text-2xl font-bold">{stats.rejeitado}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setFilter('all')}>
          Mostrar Todos ({bugs.length})
        </Button>
      </div>

      <div className="space-y-3">
        {filteredBugs.length === 0 ? (
          <Card className="p-8 text-center">
            <Bug className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum bug encontrado neste filtro</p>
          </Card>
        ) : (
          filteredBugs.map((bug) => {
            const StatusIcon = STATUS_ICONS[bug.status]
            return (
              <Card key={bug.id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <StatusIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{bug.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Página: {bug.pagina} • {new Date(bug.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      <Badge className={PRIORIDADE_COLORS[bug.prioridade]}>
                        {PRIORIDADE_LABELS[bug.prioridade]}
                      </Badge>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap">{bug.descricao}</p>
                    
                    <div className="flex gap-2 pt-2">
                      <Select value={bug.status} onValueChange={(value) => updateBugStatus(bug.id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="rejeitado">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={bug.prioridade} onValueChange={(value) => updateBugPriority(bug.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
