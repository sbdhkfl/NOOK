import * as React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="text-6xl font-bold text-neutral-200 dark:text-neutral-800">404</div>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Page not found</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">The page you're looking for doesn't exist.</p>
      <Link to="/feed" className="mt-4 inline-block font-medium text-brand-600 hover:text-brand-500">
        Go back to feed
      </Link>
    </div>
  )
}
