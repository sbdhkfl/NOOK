import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Conversation, Message } from '@/lib/supabase'

export function useUnreadCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Count messages in user's conversations that the user hasn't read
      const { data, error } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          messages(created_at),
          last_read_at
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to load unread count', error)
        setLoading(false)
        return
      }

      let unread = 0
      for (const cm of (data ?? [])) {
        const lastRead = cm.last_read_at ? new Date(cm.last_read_at).getTime() : 0
        for (const msg of (cm.messages ?? [])) {
          if (msg.sender_id !== user.id && new Date(msg.created_at).getTime() > lastRead) {
            unread += 1
          }
        }
      }

      setCount(unread)
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('unread-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => load(),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { count, loading }
}

export function useCommunityAccess(communityId: string) {
  const [isMember, setIsMember] = useState<boolean | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsMember(false)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Failed to check community access', error)
        setIsMember(false)
      } else {
        setIsMember(!!data)
        setRole(data?.role ?? null)
      }
      setLoading(false)
    }
    check()
  }, [communityId])

  return { isMember, role, loading }
}

export function useFollow(targetUserId: string) {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle()

      setIsFollowing(!!data)
      setLoading(false)
    }
    check()
  }, [targetUserId])

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
      setIsFollowing(true)
    }
  }

  return { isFollowing, loading, toggle }
}
