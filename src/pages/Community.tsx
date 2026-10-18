import * as React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCommunityAccess } from '@/hooks/useSocial'
import { supabase } from '@/lib/supabase'
import { Loader2, Users, ShieldCheck, Lock } from 'lucide-react'

export default function Community() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isMember, role, loading } = useCommunityAccess(id ?? '')
  const [community, setCommunity] = React.useState<any>(null)
  const [members, setMembers] = React.useState<any[]>([])

  React.useEffect(() => {
    const load = async () => {
      if (!id) return
      const { data } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single()
      setCommunity(data)

      const { data: memberData } = await supabase
        .from('community_members')
        .select(`, user:profiles(id, username, display_name, avatar_url, role)`)
        .eq('community_id', id)
      setMembers((memberData ?? []).map((m: any) => m.user))
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!community) {
    return <div className="p-10 text-center">Community not found.</div>
  }

  if (isMember === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] text-center p-6">
        <Lock className="h-12 w-12 text-neutral-400 mb-3" />
        <h2 className="text-xl font-semibold">
          {community.is_private ? 'This is a private community.' : 'Community not found.'}
        </h2>
        <p className="mt-2 text-neutral-500">
          You need to be a member to view this community.
        </p>
        <Button onClick={() => navigate('/communities')}>Browse communities</Button>
      </div>
    )
  }

  const isOwner = role === 'owner'

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-56px)]">
      <aside className="lg:w-72 flex-shrink-0">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar src={community.avatar_url} alt={community.name} className="h-14 w-14" />
            <div>
              <h2 className="font-bold">{community.name}</h2>
              <Badge variant={community.is_private ? 'destructive' : 'secondary'} className="text-xs">
                {community.is_private ? 'Private' : 'Public'}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{community.description}</p>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
            <Users className="h-4 w-4" /> <span>{members.length} members</span>
          </div>
          <Button className="w-full" onClick={() => {}}>
            {isMember ? 'Joined' : 'Join community'}
          </Button>
          {isOwner && (
            <Button variant="outline" className="w-full mt-2" onClick={() => {}}>
              Manage community
            </Button>
          )}
        </Card>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="font-display text-xl font-bold">{community.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">General</Button>
            <Button variant="outline" size="sm">Announcements</Button>
          </div>
        </header>

        <div className="p-4">
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {community.owner_id && members.find((m) => m.id === community.owner_id)?.avatar_url ? (
                    <img src={members.find((m) => m.id === community.owner_id)?.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <span className="text-xs">O</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Welcome to {community.name}!</div>
                  <div className="text-sm text-neutral-500 mt-1">Start sharing with the community.</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
