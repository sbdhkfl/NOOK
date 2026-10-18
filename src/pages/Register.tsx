import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export default function Register() {
  const navigate = useNavigate()
  const { setSessionUserId } = useAuthStore()

  const [form, setForm] = React.useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            display_name: form.displayName,
          },
        },
      })
      if (err) throw err

      // Create profile row
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: user.id,
          username: form.username,
          display_name: form.displayName || null,
        })
        if (profileErr) throw profileErr

        // Create default preferences
        await supabase.from('user_preferences').insert({
          id: user.id,
        })

        setSessionUserId(user.id)
      }

      navigate('/feed')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <nav className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-xl tracking-tight text-neutral-900 dark:text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white font-bold">N</div>
            NOOK
          </Link>
          <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Already have an account? Log in
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Join NOOK
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Create your account to start sharing and connecting.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">Create your account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Display name"
                placeholder="Alex Rivera"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                icon={<User className="h-4 w-4" />}
              />
              <Input
                label="Username"
                placeholder="alexrivera"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                helperText="Unique, public handle. Cannot be changed later."
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                helperText="At least 8 characters"
                icon={<Lock className="h-4 w-4" />}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <ArrowRight className="h-4 w-4 animate-spin" /> : 'Create account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
