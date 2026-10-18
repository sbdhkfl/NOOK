import * as React from 'react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xl mb-4">
        N
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
        Welcome to NOOK
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Your social space, your way. Connect, share, and build communities.
      </p>
    </div>
  )
}
