'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Bug, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!titulo.trim() || !description.trim()) {
      toast.error('Por favor, preencha o título e a descrição')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao: description.trim(),
          pagina: window.location.pathname
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit bug report')
      }

      toast.success('Bug reportado com sucesso! Obrigado pelo feedback.')
      
      // Reset form
      setTitulo('')
      setDescription('')
      setIsOpen(false)
    } catch (error) {
      console.error('[dev] Error creating bug report:', error)
      toast.error('Erro ao enviar relatório. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 shadow-lg bg-background"
        >
          <Bug className="w-4 h-4 mr-2" />
          Reportar Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Reportar um Problema
          </DialogTitle>
          <DialogDescription>
            Encontrou algum bug ou problema? Nos informe para que possamos corrigir!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título do Problema <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Ex: Erro ao enviar feedback"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição Detalhada <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema encontrado com o máximo de detalhes possível..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: Ao clicar em enviar feedback, a página fica carregando indefinidamente e não completa o envio.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Relatório'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
