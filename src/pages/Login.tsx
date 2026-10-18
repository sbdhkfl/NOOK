import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export default function Landing() {
  const navigate = useNavigate()
  const { setSessionUserId } = useAuthStore()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      setSessionUserId((await supabase.auth.getUser()).data.user?.id ?? null)
      navigate('/feed')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Navbar for landing (minimal) */}
      <nav className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-xl tracking-tight text-neutral-900 dark:text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white font-bold">N</div>
            NOOK
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Log in</Link>
            <Button>Get started</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Your social space, your way.
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Connect with friends, share what matters, and build communities — all in one place.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">Welcome back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <ArrowRight className="h-4 w-4 animate-spin" /> : 'Sign in'} {loading ? <span className="sr-only">...</span> : ''}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
