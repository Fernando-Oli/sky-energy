'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Info } from 'lucide-react'

export function InfoBanner() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenModal = localStorage.getItem('hasSeenInfoModal')
      if (!hasSeenModal) {
        setIsOpen(true)
      }
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenInfoModal', 'true')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-2xl">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        Novo Sistema de Registro de Feedback
      </DialogTitle>
      <DialogDescription className="sr-only">
        Instruções sobre como usar o novo sistema de feedback digital
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 pt-4">
      <div className="space-y-4 text-sm">
        
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
          <strong className="font-semibold text-base block mb-2">
            Como funcionava antes
          </strong>
          <p className="text-muted-foreground">
            O feedback era preenchido em um formulário de duas vias. 
            Uma parte era entregue à pessoa reconhecida e a outra era depositada 
            em uma urna para controle do RH.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
          <strong className="font-semibold text-base block mb-2">
            Como funciona agora
          </strong>
          <p className="text-muted-foreground">
            O reconhecimento continua sendo feito da mesma forma: você preenche o 
            formulário físico e entrega pessoalmente à pessoa reconhecida.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <strong className="font-semibold text-base text-blue-900 dark:text-blue-100 block mb-2">
            O que mudou na prática
          </strong>
          <ul className="text-blue-800 dark:text-blue-200 list-disc pl-5 space-y-1">
            <li>Não existe mais urna física.</li>
            <li>Tire uma foto do formulário preenchido.</li>
            <li>Envie a foto através deste sistema.</li>
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <strong className="font-semibold text-base text-amber-900 dark:text-amber-100 block mb-2">
            ⚠️ Atenção
          </strong>
          <p className="text-amber-800 dark:text-amber-200">
            Este sistema serve apenas para registro e controle do RH. 
            Ele <strong>não envia o feedback automaticamente</strong> para a pessoa reconhecida.
            <br /><br />
            Continue entregando o formulário físico diretamente à pessoa.
          </p>
        </div>

      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        Este aviso será exibido apenas uma vez.
      </p>
    </div>
  </DialogContent>
</Dialog>

  )
}
