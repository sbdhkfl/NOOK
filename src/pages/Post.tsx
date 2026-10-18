import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessionUserId } = useAuthStore()
  const [posts, setPosts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [commentContent, setCommentContent] = React.useState('')

  React.useEffect(() => {
    if (!id) return
    const load = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url),
          post_reactions(count),
          comments(count)
        `)
        .eq('id', id)
        .single()
      if (error) {
        console.error(error)
        setLoading(false)
        return
      }
      setPosts([data])
      setLoading(false)
    }
    load()
  }, [id])

  const addComment = async () => {
    if (!commentContent.trim() || !id || !sessionUserId) return
    const { error } = await supabase.from('comments').insert({
      post_id: id,
      author_id: sessionUserId,
      content: commentContent,
    })
    if (error) {
      alert(error.message)
      return
    }
    setCommentContent('')
    // refresh
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url),
        post_reactions(count),
        comments(count)
      `)
      .eq('id', id)
      .single()
    setPosts(data ? [data] : [])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const post = posts[0]
  if (!post) {
    return <div className="p-10 text-center">Post not found.</div>
  }

  const author = post.author?.[0] ?? post.author
  const reactions = post.post_reactions?.[0] ?? { count: 0 }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex gap-3 items-start mb-4">
          <Avatar src={author?.avatar_url} alt={author?.display_name ?? 'User'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 dark:text-white">
                {author?.display_name || author?.username}
              </span>
              <span className="text-xs text-neutral-500">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
            <p className="mt-2 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">{post.content}</p>
            {post.media_url && (
              <img
                src={post.media_url}
                alt="Post media"
                className="mt-3 w-full rounded-xl object-cover"
                style={{ maxHeight: 400 }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm mt-4 pt-4 border-t border-neutral-200">
          <button className="flex items-center gap-1.5 text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400">
            ❤️ <span className="font-medium">{reactions.count ?? 0}</span>
          </button>
        </div>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Comments</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Avatar src={sessionUserId ? '' : undefined} alt="You" />
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
            />
          </div>
          <Button onClick={addComment} disabled={!commentContent.trim()}>
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
