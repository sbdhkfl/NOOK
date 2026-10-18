import * as React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useConversationAccess, useMessages } from '@/hooks/useMessages'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Users, Phone, Video, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Conversation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasAccess, loading: accessLoading } = useConversationAccess(id ?? '')
  const { messages, loading, sendMessage, markAsRead } = useMessages(id ?? null)
  const [content, setContent] = React.useState('')

  React.useEffect(() => {
    if (!conversation || messages.length === 0) return
    for (const m of messages) {
      markAsRead(m.id)
    }
  }, [messages, markAsRead, conversation])

  const [conversation, setConversation] = React.useState<any>(null)

  React.useEffect(() => {
    const loadConv = async () => {
      if (!id) return
      const { data } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_members(
            *,
            user:profiles(id, username, display_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single()
      setConversation(data)
    }
    loadConv()
  }, [id])

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] text-center p-6">
        <h2 className="text-xl font-semibold">You don't have access to this conversation.</h2>
        <p className="mt-2 text-neutral-500">You must be a member to view this conversation.</p>
        <Button onClick={() => navigate('/messages')}>Back to messages</Button>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const isGroup = conversation.type === 'group'
  const members = (conversation.conversation_members ?? []).map((m: any) => m.user)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !id) return
    await sendMessage(content)
    setContent('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <Link to="/messages" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            ←
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full {isGroup ? 'bg-brand-100' : 'bg-neutral-200'} flex items-center justify-center">
              {isGroup ? <Users className="h-4 w-4 text-brand-600" /> : <Avatar src={members[0]?.avatar_url} alt={members[0]?.display_name} className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="font-semibold">{isGroup ? conversation.name : members[0]?.display_name || members[0]?.username}</h2>
              <p className="text-xs text-neutral-500">{isGroup ? `${members.length} members` : 'Direct message'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="text-neutral-600">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-neutral-600">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-neutral-600">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 text-sm mt-10">No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === (conversation.created_by || '') ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`rounded-xl p-3 max-w-[80%] ${
              msg.sender_id === (conversation.created_by || '')
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span className="text-[10px] opacity-60 mt-1 block text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </Card>
          </div>
        ))}
        {loading && <div className="text-center text-neutral-400 text-sm">Loading...</div>}
      </div>

      <form onSubmit={handleSend} className="px-4 py-3 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message..."
            className="flex-1 min-h-[44px] max-h-[120px] border-0 shadow-none p-2 text-sm resize-none focus:ring-0 dark:bg-transparent"
          />
          <Button type="submit" disabled={!content.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
