'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex bg-gradient-to-r from-[#2824B4] to-[#080830] items-center justify-center p-4">
        <Card className="p-7 m-7 border-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">SkyEnergy</h1>
            <p className="text-muted-foreground text-sm">Grupo Skyline - Sistema de Reconhecimento</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/submit')}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              Enviar Feedback
            </Button>

            <Button
              onClick={() => router.push('/hr/login')}
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-foreground"
              size="lg"
            >
              Acesso RH
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Reconheça seus colegas e celebre as conquistas da equipe
          </p>
        </Card>
    </div>
  )
}
