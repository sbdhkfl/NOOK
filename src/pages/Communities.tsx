import * as React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Search as SearchIcon, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Communities() {
  const navigate = useNavigate()
  const [communities, setCommunities] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isPrivate, setIsPrivate] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('communities')
        .select(`
          *,
          community_members(count)
        `)
        .order('created_at', { ascending: false })
      setCommunities(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: community, error } = await supabase
        .from('communities')
        .insert({ name, slug, description, is_private: isPrivate, owner_id: user.id })
        .select()
        .single()
      if (error) throw error
      await supabase.from('community_members').insert({
        community_id: community.id,
        user_id: user.id,
        role: 'owner',
      })
      setCommunities((prev) => [community, ...prev])
      setCreateOpen(false)
      setName('')
      setSlug('')
      setDescription('')
      setIsPrivate(false)
      navigate(`/communities/${community.id}`)
    } catch (err: any) {
      alert(err.message || 'Failed to create community')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Discover and join communities around shared interests.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create community
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((c) => (
          <Card key={c.id} className="p-4 hover:shadow-sm transition-shadow group">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={c.avatar_url} alt={c.name} className="h-10 w-10" />
              <div>
                <div className="font-semibold">{c.name}</div>
                <Badge variant="outline" className="text-xs">{c.is_private ? 'Private' : 'Public'}</Badge>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">{c.description}</p>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{(c.community_members?.[0]?.count ?? 0)} members</span>
              <Link to={`/communities/${c.id}`} className="font-medium text-brand-600 hover:text-brand-500">
                View community →
              </Link>
            </div>
          </Card>
        ))}
        {communities.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">No communities yet.</div>
        )}
      </div>

      {createOpen && (
        <Card className="max-w-md mx-auto animate-slide-up">
          <div className="p-6">
            <h3 className="font-semibold mb-4">Create a community</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Community name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Weekly"
              />
              <Input
                label="Slug (URL)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. design-weekly"
                helperText="Used in the community URL. Lowercase, no spaces."
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700"
                />
                <label className="text-sm">Private community (invite-only)</label>
              </div>
              {creating && <p className="text-sm text-neutral-500">Creating...</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !name.trim() || !slug.trim()}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create community'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}
    </div>
  )
}
