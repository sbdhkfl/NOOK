import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Image, Search as SearchIcon } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

export default function Feed() {
  const navigate = useNavigate()
  const { user, sessionUserId } = useAuthStore()
  const { posts, loading, error, hasMore, fetchPosts, createPost, deletePost } = usePosts()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [content, setContent] = React.useState('')
  const [posting, setPosting] = React.useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      await createPost(content)
      setContent('')
      setCreateOpen(false)
      await fetchPosts(true)
    } catch (err: any) {
      alert(err.message || 'Failed to create post')
    } finally {
      setPosting(false)
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Feed</h1>
          <p className="text-neutral-500 dark:text-neutral-400">What's happening with people you follow?</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search posts..." className="w-64" icon={<SearchIcon className="h-4 w-4" />} />
          <Button onClick={() => setCreateOpen(true)}>Create post</Button>
        </div>
      </div>

      {/* Create post dialog (inline simple version) */}
      {createOpen && (
        <Card className="max-w-xl mx-auto animate-slide-up">
          <div className="p-6">
            <h3 className="font-semibold mb-4">Create a post</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-3">
                <Avatar src={user?.avatar_url} alt={user?.display_name ?? 'You'} />
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 min-h-[120px]"
                />
              </div>
              <div className="flex items-center gap-4 text-neutral-500 text-sm">
                <button type="button" className="flex items-center gap-2 hover:text-brand-600">
                  <Image className="h-4 w-4" /> Add media
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={posting || !content.trim()}>
                  {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {error && <div className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>}

      <div className="grid gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={deletePost} />
        ))}
        {hasMore && (
          <button
            onClick={() => fetchPosts(false)}
            className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-brand-600 hover:text-brand-500"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  )
}

function PostCard({ post, onDelete }: { post: any; onDelete: (id: string) => void }) {
  const navigate = useNavigate()
  const { sessionUserId } = useAuthStore()
  const isAuthor = post.author_id === sessionUserId

  const author = post.author?.[0] ?? post.author
  const reactions = post.post_reactions?.[0] ?? { count: 0 }
  const commentCount = post.comments?.[0] ?? { count: 0 }

  return (
    <Card onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer hover:shadow-md transition-shadow group">
      <div className="p-4">
        <div className="flex gap-3 items-start">
          <Avatar src={author?.avatar_url} alt={author?.display_name ?? 'User'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 dark:text-white truncate">
                {author?.display_name || author?.username || 'User'}
              </span>
              <span className="text-xs text-neutral-500">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">{post.content}</p>
            {post.media_url && (
              <div className="mt-3 rounded-lg overflow-hidden border border-neutral-200">
                <img src={post.media_url} alt="Post media" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>
          {isAuthor && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Delete this post?')) onDelete(post.id)
              }}
              className="text-neutral-400 hover:text-red-600 p-1"
            >
              ⋮
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-6 text-sm">
          <button
            onClick={(e) => {
              e.stopPropagation()
              // toggle reaction handled via realtime + UI optimistic could go here
            }}
            className="flex items-center gap-1.5 text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
          >
            ❤️ <span className="font-medium">{reactions.count ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400">
            💬 <span className="font-medium">{commentCount.count ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400">
            ↗️ Share
          </button>
          <button className="ml-auto text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400">
            🔖 Save
          </button>
        </div>
      </div>
    </Card>
  )
}
