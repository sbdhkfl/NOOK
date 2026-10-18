import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface AlertProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  className?: string
}

const alertVariants = {
  default: 'bg-blue-50 border-blue-200 text-blue-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
}

export function Alert({ title, description, variant = 'default', className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        alertVariants[variant],
        className,
      )}
      {...props}
    >
      {title && (
        <h4 className="mb-1 font-medium">{title}</h4>
      )}
      {description && <p className="text-sm">{description}</p>}
      <button
        type="button"
        className="absolute right-2 top-2 rounded-sm p-1 text-current opacity-50 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          ;(e.currentTarget.parentElement as HTMLElement).style.display = 'none'
        }}
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
