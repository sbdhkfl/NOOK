import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversations } from '@/hooks/useMessages'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Plus, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Messages() {
  const { conversations, loading, createGroupConversation } = useConversations()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [groupName, setGroupName] = React.useState('')
  const [members, setMembers] = React.useState<string[]>([])
  const [memberQuery, setMemberQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [creating, setCreating] = React.useState(false)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreating(true)
    try {
      await createGroupConversation(groupName, members)
      setCreateOpen(false)
      setGroupName('')
      setMembers([])
      setSearchResults([])
    } catch (err: any) {
      alert(err.message || 'Failed to create group')
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
      {/* Sidebar: conversation list */}
      <div className="flex-1 min-w-0 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold">Messages</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="w-full mt-2">
            New conversation
          </Button>
        </div>

        <div className="p-2">
          <div className="relative mb-2">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-9 pr-3 h-9 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
            />
          </div>
          <div className="space-y-1">
            {conversations.map((conv) => {
              const otherMembers = (conv.conversation_members ?? []).filter(
                (m: any) => m.user_id !== (conv.created_by ?? ''),
              )
              const isGroup = conv.type === 'group'
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Avatar src={otherMembers[0]?.user?.avatar_url} alt="User" className="h-8 w-8" />
                    {isGroup && <span className="absolute -right-1 -bottom-1 h-1.5 w-1.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{isGroup ? conv.name : otherMembers[0]?.user?.display_name || 'User'}</div>
                    <div className="text-xs text-neutral-500 truncate">Tap to open conversation</div>
                  </div>
                </button>
              )
            })}
            {conversations.length === 0 && <div className="text-center py-8 text-neutral-500 text-sm">No conversations yet.</div>}
          </div>
        </div>
      </div>

      {/* Create conversation modal (simple inline) */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 p-6 animate-slide-up">
            <h3 className="font-semibold mb-4">New group conversation</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group name</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Project Team"
                  className="w-full h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Add members</label>
                <div className="relative">
                  <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Search users by username..."
                    className="w-full pl-9 h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-800 dark:border-neutral-700"
                  />
                </div>
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (!members.includes(u.id)) setMembers([...members, u.id])
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100 cursor-pointer"
                  >
                    <Avatar src={u.avatar_url} alt={u.display_name} className="h-6 w-6" />
                    <span className="text-sm">{u.display_name || u.username}</span>
                  </div>
                ))}
                {members.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-brand-100 text-brand-700 text-xs">
                    member
                  </span>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !groupName.trim() || members.length === 0}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
