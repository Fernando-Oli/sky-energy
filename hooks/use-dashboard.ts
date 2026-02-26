'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface Feedback {
  id: string
  from_name: string
  to_name: string
  categories: string[]
  reason?: string
  photo_url?: string
  created_at: string
  status?: string
  approved_at?: string
  rejected_at?: string
}

export type TabId = 'pending' | 'history' | 'awards' | 'employees' | 'bugs'

export interface DateRange {
  start: string
  end: string
}

export const categoryColors: Record<string, string> = {
  'Inovação': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Empatia': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'Confiança': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Eficiência': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

export function getAvailableMonths() {
  const months = []
  const currentDate = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push(date.toISOString().substring(0, 7))
  }
  return months
}

export function useDashboard() {
  const router = useRouter()

  // Auth
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('pending')

  // Pending feedbacks
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({ approved: 0, rejected: 0 })

  // Reject dialog
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // Photo modal
  const [fullscreenPhotoUrl, setFullscreenPhotoUrl] = useState<string | null>(null)

  // Awards / Champions
  const [champions, setChampions] = useState<Record<string, any>>({})
  const [randomFeedback, setRandomFeedback] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))
  const [isDrawing, setIsDrawing] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [topSenders, setTopSenders] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  // History
  const [approvedFeedbacks, setApprovedFeedbacks] = useState<Feedback[]>([])

  // Employees
  const [employees, setEmployees] = useState<any[]>([])
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const [newEmployeeSetor, setNewEmployeeSetor] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<any>(null)

  // --- Auth ---
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

  // --- Fetchers ---
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/hr/validate')
      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }
      if (!response.ok) throw new Error('Failed to fetch feedbacks')
      const data = await response.json()
      setFeedbacks(data.feedbacks)
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
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
        fetch(`/api/hr/feedbacks?status=rejected&month=${monthYear}`),
      ])
      if (approvedRes.ok && rejectedRes.ok) {
        const approvedData = await approvedRes.json()
        const rejectedData = await rejectedRes.json()
        const approved = (approvedData.feedbacks || []).map((f: any) => ({ ...f, status: 'approved' }))
        const rejected = (rejectedData.feedbacks || []).map((f: any) => ({ ...f, status: 'rejected' }))
        setApprovedFeedbacks(
          [...approved, ...rejected].sort(
            (a, b) =>
              new Date(b.approved_at || b.rejected_at || b.created_at).getTime() -
              new Date(a.approved_at || a.rejected_at || a.created_at).getTime()
          )
        )
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

  const fetchDashboardData = useCallback(async (monthYear: string, range?: DateRange | null) => {
    try {
      const params = range
        ? `startDate=${range.start}&endDate=${range.end}`
        : `monthYear=${monthYear}`

      const [championsRes, randomRes, sendersRes] = await Promise.all([
        fetch(`/api/dashboard/champions?${params}`),
        fetch(`/api/dashboard/random?${params}`),
        fetch(`/api/dashboard/top-senders?${params}`),
      ])

      if (championsRes.ok) {
        const championsData = await championsRes.json()
        setChampions(championsData.champions)
      }
      if (randomRes.ok) {
        const randomData = await randomRes.json()
        setRandomFeedback(randomData.feedback)
      }
      if (sendersRes.ok) {
        const sendersData = await sendersRes.json()
        setTopSenders(sendersData.senders || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }, [])

  // --- Handlers ---
  const handleApprove = async (feedback: Feedback) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/hr/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: feedback.id, action: 'approve' }),
      })
      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }
      if (!response.ok) throw new Error('Failed to approve feedback')
      toast.success('Feedback aprovado!')
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id))
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: currentFeedback.id,
          action: 'reject',
          rejectionReason,
        }),
      })
      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }
      if (!response.ok) throw new Error('Failed to reject feedback')
      toast.success('Feedback rejeitado')
      setFeedbacks((prev) => prev.filter((f) => f.id !== currentFeedback.id))
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
    setDateRange(null)
    fetchDashboardData(newMonth)
  }

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range)
    if (range) {
      fetchDashboardData(selectedMonth, range)
    } else {
      fetchDashboardData(selectedMonth)
    }
  }

  const handleDraw = async () => {
    setIsDrawing(true)
    setShowWinner(false)
    try {
      const params = dateRange
        ? `startDate=${dateRange.start}&endDate=${dateRange.end}`
        : `monthYear=${selectedMonth}`
      const randomRes = await fetch(`/api/dashboard/random?${params}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      if (randomRes.ok) {
        const randomData = await randomRes.json()
        setRandomFeedback(randomData.feedback)
        setShowWinner(true)
      } else {
        toast.error('Erro ao realizar sorteio')
      }
    } catch (error) {
      console.error('Error drawing random feedback:', error)
      toast.error('Erro ao realizar sorteio')
    } finally {
      setIsDrawing(false)
    }
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
      const response = await fetch('/api/employees/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.employee) {
          setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)))
        }
        toast.success('Funcionário atualizado')
        setEditingEmployee(null)
        await fetchEmployees()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao atualizar')
      }
    } catch (error) {
      toast.error('Erro ao atualizar funcionário')
    }
  }

  const handleToggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    await handleUpdateEmployee(id, { ativo: !currentStatus })
  }

  const handleRejectApproved = async (feedbackId: string) => {
    setCurrentFeedback(approvedFeedbacks.find((f) => f.id === feedbackId) || null)
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
        body: JSON.stringify({ feedbackId: currentFeedback.id, reason: rejectionReason }),
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
        body: JSON.stringify({ feedbackId, categories }),
      })
      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/hr/login')
        return
      }
      if (!response.ok) throw new Error('Failed to update categories')
      toast.success('Categorias atualizadas!')
      setFeedbacks((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, categories } : f)))
      setApprovedFeedbacks((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, categories } : f)))
    } catch (error) {
      console.error('Error updating categories:', error)
      toast.error('Erro ao atualizar categorias')
      throw error
    }
  }

  // --- Tab switch side effects ---
  const switchTab = (tab: TabId) => {
    setActiveTab(tab)
    if (tab === 'history') fetchApprovedFeedbacks(selectedMonth)
    if (tab === 'awards') fetchDashboardData(selectedMonth, dateRange)
    if (tab === 'employees') fetchEmployees()
  }

  return {
    // Auth
    user,
    loading,
    handleLogout,

    // Navigation
    activeTab,
    switchTab,

    // Pending
    feedbacks,
    actionLoading,
    stats,
    handleApprove,

    // Reject dialog
    currentFeedback,
    setCurrentFeedback,
    rejectionReason,
    setRejectionReason,
    showRejectDialog,
    setShowRejectDialog,
    handleReject,
    handleRejectApprovedSubmit,

    // Photo modal
    fullscreenPhotoUrl,
    setFullscreenPhotoUrl,

    // Awards
    champions,
    randomFeedback,
    selectedMonth,
    isDrawing,
    showWinner,
    topSenders,
    dateRange,
    handleMonthChange,
    handleDateRangeChange,
    handleDraw,

    // History
    approvedFeedbacks,
    handleRejectApproved,

    // Employees
    employees,
    newEmployeeName,
    setNewEmployeeName,
    newEmployeeSetor,
    setNewEmployeeSetor,
    editingEmployee,
    setEditingEmployee,
    handleAddEmployee,
    handleUpdateEmployee,
    handleToggleEmployeeStatus,

    // Categories
    handleUpdateCategories,
  }
}
