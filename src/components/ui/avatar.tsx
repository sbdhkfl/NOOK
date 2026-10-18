import * as React from 'react'
import { cn } from '@/utils/cn'

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'default' | 'lg'
}

const sizeClasses = {
  sm: 'h-6 w-6',
  default: 'h-8 w-8',
  lg: 'h-10 w-10',
}

export function Avatar({ src, alt, size = 'default', className, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={src ?? ''}
        alt={alt ?? ''}
        className="aspect-square object-cover h-full w-full"
        {...props}
      />
      {!src && (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium">
          {alt ? alt.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </span>
  )
}
