import * as React from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function Search() {
  const [query, setQuery] = React.useState('')
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      setUsers([])
      return
    }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_private')
        .ilike('username', `%${query}%`)
        .limit(20)
      setUsers(data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(handleSearch, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="font-display text-2xl font-bold tracking-tight">Search</h1>
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1">
        {loading && <div className="text-center py-8 text-neutral-500 text-sm">Searching...</div>}
        {!loading && query.trim() && users.length === 0 && (
          <div className="text-center py-8 text-neutral-500 text-sm">No users found.</div>
        )}
        <div className="space-y-1">
          {users.map((u) => (
            <Link
              key={u.id}
              to={`/profile/${u.username}`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Avatar src={u.avatar_url} alt={u.display_name} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{u.display_name || u.username}</div>
                <div className="text-xs text-neutral-500 truncate">@{u.username}</div>
              </div>
              {u.is_private && (
                <Button variant="outline" size="sm" className="text-xs">
                  Private
                </Button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
