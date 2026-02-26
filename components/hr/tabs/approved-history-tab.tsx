'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InlineCategoryEditor } from '@/components/hr/inline-category-editor'

interface Feedback {
  id: string
  from_name: string
  to_name: string
  categories: string[]
  reason?: string
  photo_url?: string
  created_at: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  status?: 'approved' | 'rejected'
  from_setor?: string
  to_setor?: string
}

interface ApprovedHistoryTabProps {
  approvedFeedbacks: Feedback[]
  categoryColors: Record<string, string>
  onUpdateCategories: (feedbackId: string, categories: string[]) => Promise<void>
}

export function ApprovedHistoryTab({
  approvedFeedbacks,
  categoryColors,
  onUpdateCategories,
}: ApprovedHistoryTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Histórico de Feedbacks (Aprovados e Rejeitados)</h2>
      <div className="space-y-4">
        {approvedFeedbacks.map((feedback) => {
          const isRejected = feedback.status === 'rejected' || feedback.rejected_at
          
          return (
            <Card key={feedback.id} className={`p-6 ${isRejected ? 'border-red-200 dark:border-red-900' : ''}`}>
              <div className="flex gap-6">
                {/* Left Side - Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
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
                    <Badge variant={isRejected ? 'destructive' : 'default'} className="flex-shrink-0">
                      {isRejected ? 'Rejeitado' : 'Aprovado'}
                    </Badge>
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
                  
                  {isRejected && feedback.rejection_reason && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Motivo da rejeição:</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{feedback.rejection_reason}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {isRejected ? 'Rejeitado em: ' : 'Aprovado em: '}
                    {new Date(feedback.rejected_at || feedback.approved_at || feedback.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                {/* Right Side - Image */}
                {feedback.photo_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={feedback.photo_url || "/placeholder.svg"}
                      alt="Feedback"
                      className="w-40 h-40 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-border"
                      onClick={() => {
                        const fullscreenImg = document.createElement('div')
                        fullscreenImg.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer'
                        fullscreenImg.onclick = () => fullscreenImg.remove()
                        const img = document.createElement('img')
                        img.src = feedback.photo_url
                        img.className = 'max-w-[90vw] max-h-[90vh] object-contain'
                        fullscreenImg.appendChild(img)
                        document.body.appendChild(fullscreenImg)
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
