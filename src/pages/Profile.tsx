import * as React from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = React.useState<any>(null)
  const [posts, setPosts] = React.useState<any[]>([])
  const [user, setUser] = React.useState<any>(null)
  const [isFollowing, setIsFollowing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [followLoading, setFollowLoading] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      if (!username) return

      const { data: authUser } = await supabase.auth.getUser()
      setUser(authUser.user ?? null)

      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      if (profErr) {
        console.error(profErr)
        setLoading(false)
        return
      }
      setProfile(prof)

      const { data: userPosts } = await supabase
        .from('posts')
        .select(`, post_reactions(count), comments(count)`)
        .eq('author_id', prof.id)
        .order('created_at', { ascending: false })
      setPosts(userPosts ?? [])

      if (authUser.user) {
        const { data: follow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', authUser.user.id)
          .eq('following_id', prof.id)
          .maybeSingle()
        setIsFollowing(!!follow)
      }
      setLoading(false)
    }
    load()
  }, [username])

  const toggleFollow = async () => {
    if (!profile || !user) return
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id)
        setIsFollowing(false)
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
        setIsFollowing(true)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!profile) {
    return <div className="p-10 text-center">Profile not found.</div>
  }

  const isOwn = user?.id === profile.id

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-end">
        <div className="flex-shrink-0">
          <Avatar src={profile.avatar_url} alt={profile.display_name} className="h-32 w-32 border-4 border-neutral-200 dark:border-neutral-800" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold">{profile.display_name || profile.username}</h1>
              <p className="text-neutral-500 dark:text-neutral-400">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-neutral-700 dark:text-neutral-300">{profile.bio}</p>}
            </div>
            <div className="flex items-center gap-2">
              {isOwn ? (
                <Button>Edit profile</Button>
              ) : (
                <Button onClick={toggleFollow} disabled={followLoading}>
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              <Button variant="outline">Message</Button>
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <div className="font-semibold">{posts.length}</div>
              <div className="text-neutral-500">Posts</div>
            </div>
            <div>
              <div className="font-semibold">0</div>
              <div className="text-neutral-500">Followers</div>
            </div>
            <div>
              <div className="font-semibold">0</div>
              <div className="text-neutral-500">Following</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-semibold">Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-3 cursor-pointer hover:shadow-sm transition-shadow">
            <p className="text-neutral-700 dark:text-neutral-300 text-sm">{post.content}</p>
            <span className="text-xs text-neutral-500 mt-2 block">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </Card>
        ))}
        {posts.length === 0 && <div className="text-center text-neutral-500">No posts yet.</div>}
      </div>
    </div>
  )
}
