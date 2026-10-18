import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Post, UserProfile, Comment } from '@/lib/supabase'

export function usePosts(pageSize = 20) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastCursor, setLastCursor] = useState<string | null>(null)

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url, is_private),
          post_reactions(count),
          comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(pageSize)

      if (!reset && lastCursor) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).gte('created_at', lastCursor)
      }

      const { data, error: err } = await query

      if (err) throw err

      if (reset) {
        setPosts(data ?? [])
        setLastCursor(data?.[data.length - 1]?.created_at ?? null)
        setHasMore((data?.length ?? 0) === pageSize)
      } else {
        setPosts((prev) => [...prev, ...(data ?? [])])
        setLastCursor(data?.[data.length - 1]?.created_at ?? lastCursor)
        setHasMore((data?.length ?? 0) === pageSize)
      }
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [pageSize, lastCursor])

  useEffect(() => {
    fetchPosts(true)

    // Subscribe to new posts and reactions
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prev) => [payload.new as Post, ...prev])
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_reactions' },
        (payload) => {
          const reaction = payload.new as any
          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === reaction.post_id) {
                return { ...p, post_reactions: [{ count: (p.post_reactions?.[0]?.count ?? 0) + 1 }] }
              }
              return p
            }),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPosts])

  const createPost = async (content: string, mediaUrl?: string, mediaType?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: user.id, content, media_url: mediaUrl ?? null, media_type: mediaType ?? null })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw error
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return { posts, loading, error, hasMore, fetchPosts, createPost, deletePost }
}

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Failed to load comments', error)
        return
      }
      setComments(data ?? [])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment])
        },
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [postId])

  const addComment = async (content: string, parentId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, parent_id: parentId ?? null, content })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return { comments, loading, addComment }
}

export function useToggleReaction(postId: string) {
  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: existing } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existing.id)
      if (error) throw error
      return 'removed'
    } else {
      const { error } = await supabase
        .from('post_reactions')
        .insert({ post_id, user_id: user.id, type: 'like' })
      if (error) throw error
      return 'added'
    }
  }

  return { toggle }
}

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('Failed to load profile', error)
        return
      }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [userId])

  return { profile, loading }
}
