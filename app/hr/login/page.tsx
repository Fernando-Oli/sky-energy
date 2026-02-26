'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function HRLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already logged in on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/hr/me', {
          method: 'POST',
          credentials: 'include',
        })
        const data = await response.json()
        if (data.authenticated) {
          window.location.href = '/hr/dashboard'
        }
      } catch (error) {
        // Not logged in, continue to login
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Preencha email e senha')
      return
    }

    setLoading(true)

    try {
      console.log('[dev] Attempting login with:', email)
      const response = await fetch('/api/hr/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('[dev] Login response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('[dev] Login error response:', error)
        throw new Error(error.error || 'Erro ao fazer login')
      }

      const data = await response.json()
      console.log('[dev] Login successful for email:', email)

      toast.success('Bem-vindo!', {
        description: 'Redirecionando para o painel...',
        duration: 2000,
      })

      // Force hard navigation to ensure the cookie is sent on the next request
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = '/hr/dashboard'
    } catch (error) {
      console.error('[dev] Error logging in:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login'
      console.error('[dev] Final error message:', errorMessage)
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-slate-900 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white dark:bg-slate-950">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/skyline-logo.png"
              alt="Grupo SkyLine"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">SkyEnergy</h1>
          <p className="text-muted-foreground text-sm">Acesso ao Painel RH</p>
        </div>

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Autenticando...</p>
                <p className="text-blue-700 dark:text-blue-200 text-xs">Aguarde um momento</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" disabled={loading}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
