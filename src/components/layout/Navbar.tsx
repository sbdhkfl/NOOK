import * as React from 'react'
import { Sun, Moon, Menu, X, Send, Search, Users, Bell, Loader2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/auth'
import { useToastStore } from '@/store/toast'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const location = useLocation()
  const { user, sessionUserId, signOut, loading } = useAuthStore()
  const { add } = useToastStore()
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    const saved = localStorage.getItem('nook-theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('nook-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      add({ title: 'Sign out failed', description: 'Please try again.', variant: 'destructive' })
    }
  }

  const publicPaths = ['/login', '/register']
  const isPublic = publicPaths.includes(location.pathname)

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {!isPublic && (
            <button
              className="md:hidden text-neutral-600 dark:text-neutral-300"
              onClick={() => {
                // Mobile menu toggle handled by state
              }}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xl">
              N
            </div>
            <span className="font-display font-semibold tracking-tight text-neutral-900 dark:text-white">NOOK</span>
          </Link>
        </div>

        {!isPublic && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/feed" icon={<Users className="h-5 w-5" />}>Feed</NavLink>
            <NavLink to="/messages" icon={<Bell className="h-5 w-5" />}>Messages</NavLink>
            <NavLink to="/communities" icon={<Users className="h-5 w-5" />}>Communities</NavLink>
            <NavLink to="/notifications" icon={<Bell className="h-5 w-5" />}>
              Notifications
            </NavLink>
            <NavLink to="/search" icon={<Search className="h-5 w-5" />}>Search</NavLink>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isPublic ? (
            <Button asChild size="sm" as={<Link to="/login" />}>
              Log in
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <button
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={handleSignOut}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Avatar src={user?.avatar_url} alt={user?.display_name ?? 'User'} size="sm" />
                    <span className="hidden sm:inline">{user?.display_name ?? user?.username}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 rounded-md hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">
      {icon}
      {children}
    </Link>
  )
}
