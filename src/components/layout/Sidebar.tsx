import * as React from 'react'
import { Sun, Moon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth'

export function Sidebar() {
  const { user, signOut, loading } = useAuthStore()
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    const saved = localStorage.getItem('nook-theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
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
      // errors handled by auth store / toast
    }
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-6 p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xl">
            N
          </div>
          <span className="font-display font-semibold tracking-tight text-neutral-900 dark:text-white">NOOK</span>
        </Link>

        <nav className="flex flex-col gap-1">
          <SidebarLink to="/feed" icon="Users">Feed</SidebarLink>
          <SidebarLink to="/messages" icon="Bell">Messages</SidebarLink>
          <SidebarLink to="/communities" icon="Users">Communities</SidebarLink>
          <SidebarLink to="/notifications" icon="Bell">Notifications</SidebarLink>
          <SidebarLink to="/search" icon="Search">Search</SidebarLink>
        </nav>

        <div className="pt-4 border-t border-neutral-800/50">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-auto" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <button
            className="mt-2 w-full flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? <span className="sr-only">Signing out...</span> : 'Sign out'}
            <Avatar
              src={user?.avatar_url}
              alt={user?.display_name ?? 'User'}
              className="ml-2 h-5 w-5"
            />
          </button>
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon, children }: { to: string; icon: string; children: string }) {
  const IconMap: Record<string, React.ElementType> = {
    Users: () => <span className="h-5 w-5">👥</span>,
    Bell: () => <span className="h-5 w-5">🔔</span>,
    Search: () => <span className="h-5 w-5">🔍</span>,
  }
  const Icon = IconMap[icon] || IconMap.Users
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 rounded-lg hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">
      <Icon />
      {children}
    </Link>
  )
}
