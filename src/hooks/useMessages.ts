import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Conversation, Message } from '@/lib/supabase'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('conversation_members')
        .select(`
          conversation:conversations(
            *,
            conversation_members(
              *,
              user:profiles(id, username, display_name, avatar_url)
            ),
            messages(*)
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (error) {
        console.error('Failed to load conversations', error)
        setLoading(false)
        return
      }

      const convos = (data ?? []).map((cm: any) => cm.conversation)
      setConversations(convos)
      setLoading(false)
    }
    load()
  }, [])

  const createDirectMessage = async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if a direct conversation already exists between these two users
    const { data: existing } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        conversation:conversations(type)
      `)
      .eq('user_id', user.id)
      .eq('conversation.type', 'direct')

    const shared = (existing ?? []).find((cm: any) =>
      (cm.conversation_members ?? []).some((m: any) => m.user_id === otherUserId)
    )

    if (shared) {
      return { id: shared.conversation_id }
    }

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: user.id })
      .select()
      .single()
    if (convError) throw convError

    await supabase.from('conversation_members').insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ])

    return conv
  }

  const createGroupConversation = async (name: string, userIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'group', name, created_by: user.id })
      .select()
      .single()
    if (convError) throw convError

    await supabase.from('conversation_members').insert([
      ...userIds.map((id) => ({ conversation_id: conv.id, user_id: id })),
      { conversation_id: conv.id, user_id: user.id, role: 'admin' },
    ])

    return conv
  }

  return { conversations, loading, createDirectMessage, createGroupConversation }
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, username, display_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Failed to load messages', error)
        setLoading(false)
        return
      }
      setMessages(data ?? [])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversationId])

  const sendMessage = async (content: string, mediaUrl?: string, mediaType?: string, replyTo?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    if (!conversationId) throw new Error('No conversation')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        media_url: mediaUrl ?? null,
        media_type: mediaType ?? null,
        reply_to: replyTo ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const markAsRead = async (messageId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('message_reads').insert({ message_id: messageId, user_id: user.id })
  }

  return { messages, loading, sendMessage, markAsRead }
}

export function useConversationAccess(conversationId: string) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('conversation_members')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Failed to check conversation access', error)
        setHasAccess(false)
      } else {
        setHasAccess(!!data)
      }
      setLoading(false)
    }
    check()
  }, [conversationId])

  return { hasAccess, loading }
}
