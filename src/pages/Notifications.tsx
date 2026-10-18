import * as React from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell } from 'lucide-react'

export default function Notifications() {
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('notifications')
        .select(`, actor:profiles(id, username, display_name, avatar_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as any, ...prev])
        },
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          <Bell className="mr-2 h-5 w-5" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`cursor-pointer p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                !n.read ? 'border-l-2 border-brand-600 bg-brand-50/50 dark:bg-brand-500/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <span className="text-xs">{n.actor?.display_name?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{notificationText(n)}</p>
                  <span className="text-xs text-neutral-500 mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function notificationText(n: any): string {
  const actor = n.actor?.display_name || n.actor?.username || 'Someone'
  switch (n.type) {
    case 'message':
      return `${actor} sent you a message.`
    case 'like':
      return `${actor} liked your post.`
    case 'comment':
      return `${actor} commented on your post.`
    case 'follow':
      return `${actor} started following you.`
    case 'mention':
      return `${actor} mentioned you.`
    case 'invite':
      return `${actor} invited you to a community.`
    default:
      return `${actor} interacted with your content.`
  }
}
