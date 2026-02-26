'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

interface Feedback {
  id: string
  from_name: string
  from_setor?: string
  to_name: string
  to_setor?: string
  categories: string[]
  reason?: string
  photo_url?: string
  created_at: string
}

const categoryColors: Record<string, string> = {
  'Inovação': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Empatia': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Confiança': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Eficiência': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

interface FeedbackCardProps {
  feedback: Feedback
  onApprove: (feedback: Feedback) => void
  onReject: (feedback: Feedback) => void
  onPhotoClick: (url: string) => void
}

export function FeedbackCard({ feedback, onApprove, onReject, onPhotoClick }: FeedbackCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {feedback.categories.map((cat) => (
            <Badge key={cat} className={categoryColors[cat]}>
              {cat}
            </Badge>
          ))}
        </div>

        <div>
          <p className="text-sm mb-2">
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
          {feedback.reason && (
            <p className="text-sm text-muted-foreground mt-2 bg-muted p-3 rounded-lg">
              {feedback.reason}
            </p>
          )}
        </div>

        {feedback.photo_url && (
          <div
            className="relative h-64 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onPhotoClick(feedback.photo_url!)}
          >
            <Image
              src={feedback.photo_url || "/placeholder.svg"}
              alt="Feedback"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950 bg-transparent"
            onClick={() => onApprove(feedback)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovar
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950 bg-transparent"
            onClick={() => onReject(feedback)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeitar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-right">
          {new Date(feedback.created_at).toLocaleString('pt-BR')}
        </p>
      </div>
    </Card>
  )
}
