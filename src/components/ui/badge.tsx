import * as React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const badgeVariants = {
  default: 'bg-brand-600 text-white',
  secondary: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200',
  destructive: 'bg-red-500 text-white',
  outline: 'border border-neutral-300 text-neutral-900 dark:border-neutral-700 dark:text-neutral-200',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}
