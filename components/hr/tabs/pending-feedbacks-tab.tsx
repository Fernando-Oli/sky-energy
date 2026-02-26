'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { InlineCategoryEditor } from '@/components/hr/inline-category-editor'
import { PaginationControls } from '@/components/ui/pagination-controls'

interface Feedback {
  id: string
  from_name: string
  to_name: string
  categories: string[]
  reason?: string
  photo_url?: string
  created_at: string
  from_setor?: string
  to_setor?: string
}

interface PendingFeedbacksTabProps {
  feedbacks: Feedback[]
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  actionLoading: boolean
  categoryColors: Record<string, string>
  onApprove: (feedback: Feedback) => void
  onReject: (feedback: Feedback) => void
  onPhotoClick: (url: string) => void
  onUpdateCategories: (feedbackId: string, categories: string[]) => Promise<void>
}

export function PendingFeedbacksTab({
  feedbacks,
  page,
  totalPages,
  total,
  onPageChange,
  actionLoading,
  categoryColors,
  onApprove,
  onReject,
  onPhotoClick,
  onUpdateCategories,
}: PendingFeedbacksTabProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Feedbacks Pendentes para Aprovação
        <span className="text-base font-normal text-muted-foreground ml-2">({total})</span>
      </h2>
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="p-6">
            <div className="flex gap-6">
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{feedback.from_name}</span>
                    {feedback.from_setor && (
                      <span className="text-xs text-muted-foreground ml-1">({feedback.from_setor})</span>
                    )}
                    <span className="text-muted-foreground"> reconheceu </span>
                    <span className="font-semibold text-foreground">{feedback.to_name}</span>
                    {feedback.to_setor && (
                      <span className="text-xs text-muted-foreground ml-1">({feedback.to_setor})</span>
                    )}
                  </p>
                </div>
                <InlineCategoryEditor
                  feedbackId={feedback.id}
                  currentCategories={feedback.categories}
                  categoryColors={categoryColors}
                  onUpdate={onUpdateCategories}
                />
                {feedback.reason && (
                  <p className="text-sm text-muted-foreground">{feedback.reason}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enviado em: {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => onApprove(feedback)} disabled={actionLoading} className="flex-1">
                    {actionLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Aprovando...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4 mr-2" />Aprovar</>
                    )}
                  </Button>
                  <Button variant="destructive" onClick={() => onReject(feedback)} disabled={actionLoading} className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />Rejeitar
                  </Button>
                </div>
              </div>
              {feedback.photo_url && (
                <div className="flex-shrink-0">
                  <img
                    src={feedback.photo_url}
                    alt="Feedback"
                    className="w-40 h-40 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-border"
                    onClick={() => onPhotoClick(feedback.photo_url!)}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={10}
        onPageChange={onPageChange}
      />
    </div>
  )
}
