'use client'

import { Input } from "@/components/ui/input"

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, LogOut } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { BugReportButton } from '@/components/bug-report-button'
import { BugsManager } from '@/components/hr/bugs-manager'
import { PendingFeedbacksTab } from '@/components/hr/tabs/pending-feedbacks-tab'
import { ApprovedHistoryTab } from '@/components/hr/tabs/approved-history-tab'
import { EmployeesManagerTab } from '@/components/hr/tabs/employees-manager-tab'
import { ChampionsHistoryTab } from '@/components/hr/tabs/champions-history-tab'
import { AwardsTab } from '@/components/hr/tabs/awards-tab'

interface Feedback {
  id: string
  from_name: string
  to_name: string
  categories: string[]
  reason?: string
  photo_url?: string
  created_at: string
}

export default function ValidationPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [fullscreenPhotoUrl, setFullscreenPhotoUrl] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({ approved: 0, rejected: 0 })
  const [champions, setChampions] = useState<Record<string, any>>({})
  const [randomFeedback, setRandomFeedback] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))
  const [isDrawing, setIsDrawing] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [approvedFeedbacks, setApprovedFeedbacks] = useState<Feedback[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showEmployeesManager, setShowEmployeesManager] = useState(false)
  const [showApprovedHistory, setShowApprovedHistory] = useState(false)
  const [showBugsManager, setShowBugsManager] = useState(false)
  const [showAwardsTab, setShowAwardsTab] = useState(false)
  const [topSenders, setTopSenders] = useState<any[]>([])
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const [newEmployeeSetor, setNewEmployeeSetor] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/hr/me', {
          method: 'POST',
          credentials: 'include',
        })

        const data = await response.json()

        if (!data.authenticated) {
          router.push('/hr/login')
          return
        }

        setUser(data.user)
        fetchFeedbacks()
        fetchStats()
        fetchDashboardData(selectedMonth)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/hr/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/hr/validate')

      if (response.status === 401) {
        console.log('[v0] Authentication failed, redirecting to login')
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks')
      }

      const data = await response.json()
      setFeedbacks(data.feedbacks)
    } catch (error) {
      console.error('[v0] Error fetching feedbacks:', error)
      toast.error('Erro ao carregar feedbacks')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/hr/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchApprovedFeedbacks = async (monthYear: string) => {
    try {
      const [approvedRes, rejectedRes] = await Promise.all([
        fetch(`/api/hr/feedbacks?status=approved&month=${monthYear}`),
        fetch(`/api/hr/feedbacks?status=rejected&month=${monthYear}`)
      ])
      
      if (approvedRes.ok && rejectedRes.ok) {
        const approvedData = await approvedRes.json()
        const rejectedData = await rejectedRes.json()
        
        const approved = (approvedData.feedbacks || []).map((f: any) => ({ ...f, status: 'approved' }))
        const rejected = (rejectedData.feedbacks || []).map((f: any) => ({ ...f, status: 'rejected' }))
        
        setApprovedFeedbacks([...approved, ...rejected].sort((a, b) => 
          new Date(b.approved_at || b.rejected_at || b.created_at).getTime() - 
          new Date(a.approved_at || a.rejected_at || a.created_at).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees/manage')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchDashboardData = async (monthYear: string) => {
    try {
      console.log('[dev] Fetching dashboard data for month:', monthYear)
      
      const championsRes = await fetch(`/api/dashboard/champions?monthYear=${monthYear}`)
      console.log('[dev] Champions response status:', championsRes.status)
      
      if (championsRes.ok) {
        const championsData = await championsRes.json()
        console.log('[dev] Champions data received:', championsData)
        setChampions(championsData.champions)
      } else {
        const errorText = await championsRes.text()
        console.error('[dev] Champions request failed:', errorText)
      }

      const [randomRes, sendersRes] = await Promise.all([
        fetch(`/api/dashboard/random?monthYear=${monthYear}`),
        fetch(`/api/dashboard/top-senders?monthYear=${monthYear}`),
      ])
      
      if (randomRes.ok) {
        const randomData = await randomRes.json()
        setRandomFeedback(randomData.feedback)
      }

      if (sendersRes.ok) {
        const sendersData = await sendersRes.json()
        setTopSenders(sendersData.senders || [])
      }
    } catch (error) {
      console.error('[dev] Error fetching dashboard data:', error)
    }
  }

  const handleApprove = async (feedback: Feedback) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/hr/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId: feedback.id,
          action: 'approve',
        }),
      })

      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to approve feedback')
      }

      toast.success('Feedback aprovado!')
      setFeedbacks(feedbacks.filter((f) => f.id !== feedback.id))
      setCurrentFeedback(null)
    } catch (error) {
      console.error('Error approving feedback:', error)
      toast.error('Erro ao aprovar feedback')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!currentFeedback || !rejectionReason.trim()) {
      toast.error('Preencha o motivo da rejeição')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/hr/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId: currentFeedback.id,
          action: 'reject',
          rejectionReason: rejectionReason,
        }),
      })

      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to reject feedback')
      }

      toast.success('Feedback rejeitado')
      setFeedbacks(feedbacks.filter((f) => f.id !== currentFeedback.id))
      setCurrentFeedback(null)
      setShowRejectDialog(false)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting feedback:', error)
      toast.error('Erro ao rejeitar feedback')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/hr/logout', { method: 'POST' })
    } finally {
      router.push('/hr/login')
    }
  }

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth)
    fetchDashboardData(newMonth)
  }

  const handleDraw = async () => {
    setIsDrawing(true)
    setShowWinner(false)
    
    try {
      // Fetch new random feedback
      const randomRes = await fetch(`/api/dashboard/random?monthYear=${selectedMonth}`)
      
      if (randomRes.ok) {
        const randomData = await randomRes.json()
        
        // Animate for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setRandomFeedback(randomData.feedback)
        setShowWinner(true)
      } else {
        toast.error('Erro ao realizar sorteio')
      }
    } catch (error) {
      console.error('[v0] Error drawing random feedback:', error)
      toast.error('Erro ao realizar sorteio')
    } finally {
      setIsDrawing(false)
    }
  }

  const getAvailableMonths = () => {
    const months = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push(date.toISOString().substring(0, 7))
    }
    
    return months
  }

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      toast.error('Digite o nome do funcionário')
      return
    }

    try {
      const response = await fetch('/api/employees/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newEmployeeName, setor: newEmployeeSetor }),
      })

      if (response.ok) {
        toast.success('Funcionário adicionado')
        setNewEmployeeName('')
        setNewEmployeeSetor('')
        fetchEmployees()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao adicionar')
      }
    } catch (error) {
      toast.error('Erro ao adicionar funcionário')
    }
  }

  const handleUpdateEmployee = async (id: string, updates: any) => {
    try {
      console.log('[dev] Updating employee:', { id, updates })
      const response = await fetch('/api/employees/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      console.log('[dev] Update response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[dev] Update response data:', data)
        
        // Update local state immediately for better UX
        if (data.employee) {
          setEmployees(prev => prev.map(emp => 
            emp.id === id ? { ...emp, ...updates } : emp
          ))
        }
        
        toast.success('Funcionário atualizado')
        setEditingEmployee(null)
        
        // Also refetch to ensure sync
        await fetchEmployees()
      } else {
        const errorData = await response.json()
        console.error('[dev] Update error:', errorData)
        toast.error(errorData.error || 'Erro ao atualizar')
      }
    } catch (error) {
      console.error('[dev] Update exception:', error)
      toast.error('Erro ao atualizar funcionário')
    }
  }

  const handleToggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    console.log('[dev] Toggling employee status:', { id, currentStatus, newStatus: !currentStatus })
    await handleUpdateEmployee(id, { ativo: !currentStatus })
  }

  const handleRejectApproved = async (feedbackId: string) => {
    setCurrentFeedback(approvedFeedbacks.find(f => f.id === feedbackId) || null)
    setShowRejectDialog(true)
  }

  const handleRejectApprovedSubmit = async () => {
    if (!currentFeedback) return

    if (!rejectionReason.trim()) {
      toast.error('Digite o motivo da rejeição')
      return
    }

    setActionLoading(true)

    try {
      const response = await fetch('/api/hr/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: currentFeedback.id,
          reason: rejectionReason,
        }),
      })

      if (response.ok) {
        toast.success('Feedback rejeitado')
        setShowRejectDialog(false)
        setRejectionReason('')
        fetchApprovedFeedbacks(selectedMonth)
      } else {
        toast.error('Erro ao rejeitar')
      }
    } catch (error) {
      toast.error('Erro ao rejeitar feedback')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateCategories = async (feedbackId: string, categories: string[]) => {
    try {
      const response = await fetch('/api/hr/feedbacks/update-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          categories,
        }),
      })

      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to update categories')
      }

      toast.success('Categorias atualizadas!')
      
      // Update local state
      setFeedbacks(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, categories } : f
      ))
      setApprovedFeedbacks(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, categories } : f
      ))
    } catch (error) {
      console.error('[v0] Error updating categories:', error)
      toast.error('Erro ao atualizar categorias')
      throw error
    }
  }

  const categoryColors: Record<string, string> = {
    'Inovação': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Empatia': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'Confiança': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Eficiência': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Validação de Feedbacks</h1>
              {user && <p className="text-muted-foreground mt-1">Olá, {user.email}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!showEmployeesManager && !showApprovedHistory && !showBugsManager && !showAwardsTab ? "default" : "outline"}
              onClick={() => {
                setShowEmployeesManager(false)
                setShowApprovedHistory(false)
                setShowBugsManager(false)
                setShowAwardsTab(false)
              }}
            >
              Pendentes
            </Button>
            <Button
              variant={showApprovedHistory ? "default" : "outline"}
              onClick={() => {
                setShowApprovedHistory(true)
                setShowEmployeesManager(false)
                setShowBugsManager(false)
                setShowAwardsTab(false)
                fetchApprovedFeedbacks(selectedMonth)
              }}
            >
              Histórico
            </Button>
            <Button
              variant={showAwardsTab ? "default" : "outline"}
              onClick={() => {
                setShowAwardsTab(true)
                setShowEmployeesManager(false)
                setShowApprovedHistory(false)
                setShowBugsManager(false)
                fetchDashboardData(selectedMonth)
              }}
            >
              Premiação
            </Button>
            <Button
              variant={showEmployeesManager ? "default" : "outline"}
              onClick={() => {
                setShowEmployeesManager(true)
                setShowApprovedHistory(false)
                setShowBugsManager(false)
                setShowAwardsTab(false)
                fetchEmployees()
              }}
            >
              Gerenciar Funcionários
            </Button>
            <Button
              variant={showBugsManager ? "default" : "outline"}
              onClick={() => {
                setShowBugsManager(true)
                setShowEmployeesManager(false)
                setShowApprovedHistory(false)
              }}
            >
              Bugs Reportados
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-foreground">{feedbacks.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-1">Aprovados</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-1">Rejeitados</p>
            <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
          </Card>
        </div>

        {/* Pending Feedbacks Section */}
        {!showApprovedHistory && !showEmployeesManager && !showBugsManager && !showAwardsTab && feedbacks.length > 0 && (
          <PendingFeedbacksTab
            feedbacks={feedbacks}
            actionLoading={actionLoading}
            categoryColors={categoryColors}
            onApprove={handleApprove}
            onReject={(feedback) => {
              setCurrentFeedback(feedback)
              setShowRejectDialog(true)
            }}
            onPhotoClick={setFullscreenPhotoUrl}
            onUpdateCategories={handleUpdateCategories}
          />
        )}

        {/* Bugs Manager */}
        {showBugsManager && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Bugs Reportados</h2>
            <BugsManager />
          </div>
        )}

        {/* Awards Tab */}
        {showAwardsTab && (
          <AwardsTab
            champions={champions}
            categoryColors={categoryColors}
            selectedMonth={selectedMonth}
            availableMonths={getAvailableMonths()}
            randomFeedback={randomFeedback}
            isDrawing={isDrawing}
            showWinner={showWinner}
            topSenders={topSenders}
            onMonthChange={handleMonthChange}
            onDraw={handleDraw}
          />
        )}

        {/* Employees Manager Section */}
        {showEmployeesManager && (
          <EmployeesManagerTab
            employees={employees}
            newEmployeeName={newEmployeeName}
            newEmployeeSetor={newEmployeeSetor}
            editingEmployee={editingEmployee}
            onNewEmployeeNameChange={setNewEmployeeName}
            onNewEmployeeSectorChange={setNewEmployeeSetor}
            onAddEmployee={handleAddEmployee}
            onEditingEmployeeChange={setEditingEmployee}
            onEditingNameChange={(name) => setEditingEmployee({ ...editingEmployee!, nome: name })}
            onEditingSectorChange={(sector) => setEditingEmployee({ ...editingEmployee!, setor: sector })}
            onUpdateEmployee={handleUpdateEmployee}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
          />
        )}

        {/* Approved History Section */}
        {showApprovedHistory && (
          <ApprovedHistoryTab
            approvedFeedbacks={approvedFeedbacks}
            categoryColors={categoryColors}
            onUpdateCategories={handleUpdateCategories}
          />
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Feedback</DialogTitle>
            <DialogDescription>
              Explique o motivo da rejeição
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Digite o motivo da rejeição..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason('')
              }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={showApprovedHistory ? handleRejectApprovedSubmit : handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                'Rejeitar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Photo Modal */}
      {fullscreenPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setFullscreenPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={fullscreenPhotoUrl || "/placeholder.svg"}
              alt="Feedback Fullscreen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setFullscreenPhotoUrl(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <BugReportButton />
    </div>
  )
}
