import * as React from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function Settings() {
  const [profile, setProfile] = React.useState<any>(null)
  const [prefs, setPrefs] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [displayName, setDisplayName] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [username, setUsername] = React.useState('')

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: preference } = await supabase.from('user_preferences').select('*').eq('id', user.id).single()
      setProfile(prof)
      setPrefs(preference)
      setDisplayName(prof?.display_name || '')
      setBio(prof?.bio || '')
      setUsername(prof?.username || '')
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({ display_name: displayName, bio, username }).eq('id', profile.id)
      if (prefs) {
        await supabase.from('user_preferences').update({
          email_notifications: prefs.email_notifications,
          push_notifications: prefs.push_notifications,
          dark_mode: prefs.dark_mode,
          show_online_status: prefs.show_online_status,
        }).eq('id', prefs.id)
      }
      alert('Settings saved.')
    } catch (err: any) {
      alert(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will delete your account and all your data permanently.')) return
    try {
      await supabase.auth.deleteUser()
      alert('Account deleted.')
    } catch (err: any) {
      alert(err.message || 'Failed to delete account')
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
    return <div className="p-10 text-center">Unable to load settings.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <div className="p-6">
          <h2 className="font-semibold mb-4">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
              helperText="Username cannot be changed after account creation."
            />
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Biography"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              helperText="Tell people about yourself."
            />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="font-semibold mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Email notifications</span>
              <input
                type="checkbox"
                checked={prefs?.email_notifications ?? true}
                onChange={(e) => setPrefs({ ...prefs, email_notifications: e.target.checked })}
                className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Push notifications</span>
              <input
                type="checkbox"
                checked={prefs?.push_notifications ?? true}
                onChange={(e) => setPrefs({ ...prefs, push_notifications: e.target.checked })}
                className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Dark mode</span>
              <input
                type="checkbox"
                checked={prefs?.dark_mode ?? false}
                onChange={(e) => setPrefs({ ...prefs, dark_mode: e.target.checked })}
                className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Show online status</span>
              <input
                type="checkbox"
                checked={prefs?.show_online_status ?? true}
                onChange={(e) => setPrefs({ ...prefs, show_online_status: e.target.checked })}
                className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save preferences'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="font-semibold mb-4 text-red-600">Danger zone</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Deleting your account cannot be undone. All your posts, messages, and data will be permanently removed.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  )
}
