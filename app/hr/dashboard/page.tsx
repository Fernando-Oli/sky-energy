'use client'

import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { BugReportButton } from '@/components/bug-report-button'
import { BugsManager } from '@/components/hr/bugs-manager'
import { PendingFeedbacksTab } from '@/components/hr/tabs/pending-feedbacks-tab'
import { ApprovedHistoryTab } from '@/components/hr/tabs/approved-history-tab'
import { EmployeesManagerTab } from '@/components/hr/tabs/employees-manager-tab'
import { AwardsTab } from '@/components/hr/tabs/awards-tab'
import { DashboardHeader } from '@/components/hr/dashboard-header'
import { DashboardStats } from '@/components/hr/dashboard-stats'
import { useDashboard, categoryColors, getAvailableMonths } from '@/hooks/use-dashboard'

export default function ValidationPage() {
  const d = useDashboard()

  if (d.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <DashboardHeader
          userEmail={d.user?.email}
          activeTab={d.activeTab}
          onTabChange={d.switchTab}
          onLogout={d.handleLogout}
        />

        <DashboardStats
          pendingCount={d.feedbacksTotal}
          approvedCount={d.stats.approved}
          rejectedCount={d.stats.rejected}
        />

        {/* Pending */}
        {d.activeTab === 'pending' && (
          <PendingFeedbacksTab
            feedbacks={d.feedbacks}
            page={d.feedbacksPage}
            totalPages={d.feedbacksTotalPages}
            total={d.feedbacksTotal}
            onPageChange={d.handleFeedbacksPageChange}
            actionLoading={d.actionLoading}
            categoryColors={categoryColors}
            onApprove={d.handleApprove}
            onReject={(feedback) => {
              d.setCurrentFeedback(feedback)
              d.setShowRejectDialog(true)
            }}
            onPhotoClick={d.setFullscreenPhotoUrl}
            onUpdateCategories={d.handleUpdateCategories}
          />
        )}

        {/* Bugs */}
        {d.activeTab === 'bugs' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Bugs Reportados</h2>
            <BugsManager />
          </div>
        )}

        {/* Awards */}
        {d.activeTab === 'awards' && (
          <AwardsTab
            champions={d.champions}
            categoryColors={categoryColors}
            selectedMonth={d.selectedMonth}
            availableMonths={getAvailableMonths()}
            randomFeedback={d.randomFeedback}
            isDrawing={d.isDrawing}
            showWinner={d.showWinner}
            topSenders={d.topSenders}
            dateRange={d.dateRange}
            onMonthChange={d.handleMonthChange}
            onDateRangeChange={d.handleDateRangeChange}
            onDraw={d.handleDraw}
          />
        )}

        {/* Employees */}
        {d.activeTab === 'employees' && (
          <EmployeesManagerTab
            employees={d.employees}
            page={d.employeesPage}
            totalPages={d.employeesTotalPages}
            total={d.employeesTotal}
            onPageChange={d.handleEmployeesPageChange}
            newEmployeeName={d.newEmployeeName}
            newEmployeeSetor={d.newEmployeeSetor}
            editingEmployee={d.editingEmployee}
            onNewEmployeeNameChange={d.setNewEmployeeName}
            onNewEmployeeSectorChange={d.setNewEmployeeSetor}
            onAddEmployee={d.handleAddEmployee}
            onEditingEmployeeChange={d.setEditingEmployee}
            onUpdateEmployee={d.handleUpdateEmployee}
            onToggleEmployeeStatus={d.handleToggleEmployeeStatus}
          />
        )}

        {/* History */}
        {d.activeTab === 'history' && (
          <ApprovedHistoryTab
            approvedFeedbacks={d.approvedFeedbacks}
            page={d.historyPage}
            totalPages={d.historyTotalPages}
            total={d.historyTotal}
            onPageChange={d.handleHistoryPageChange}
            categoryColors={categoryColors}
            onUpdateCategories={d.handleUpdateCategories}
          />
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={d.showRejectDialog} onOpenChange={d.setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Feedback</DialogTitle>
            <DialogDescription>Explique o motivo da rejeição</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Digite o motivo da rejeição..."
            value={d.rejectionReason}
            onChange={(e) => d.setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                d.setShowRejectDialog(false)
                d.setRejectionReason('')
              }}
              disabled={d.actionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={d.activeTab === 'history' ? d.handleRejectApprovedSubmit : d.handleReject}
              disabled={d.actionLoading}
            >
              {d.actionLoading ? (
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
      {d.fullscreenPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => d.setFullscreenPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={d.fullscreenPhotoUrl || '/placeholder.svg'}
              alt="Feedback Fullscreen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => d.setFullscreenPhotoUrl(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center text-xl"
            >
              {'✕'}
            </button>
          </div>
        </div>
      )}

      <BugReportButton />
    </div>
  )
}
