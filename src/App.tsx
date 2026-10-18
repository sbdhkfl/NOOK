import * as React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Feed from '@/pages/Feed'
import Post from '@/pages/Post'
import Profile from '@/pages/Profile'
import Messages from '@/pages/Messages'
import Conversation from '@/pages/Conversation'
import Communities from '@/pages/Communities'
import Community from '@/pages/Community'
import Search from '@/pages/Search'
import Notifications from '@/pages/Notifications'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { sessionUserId, loading } = useAuthStore()
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading session...</div>
  }
  if (!sessionUserId) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireGuest({ children }: { children: React.ReactElement }) {
  const { sessionUserId, loading } = useAuthStore()
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading session...</div>
  }
  if (sessionUserId) {
    return <Navigate to="/feed" replace />
  }
  return children
}

function App() {
  React.useEffect(() => {
    // Listen for auth changes to keep session in sync
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const store = useAuthStore.getState()
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        store.setSessionUserId(session?.user.id ?? null)
      } else if (event === 'SIGNED_OUT') {
        store.setSessionUserId(null)
        store.setUser(null)
      }
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />

        {/* Protected app */}
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="feed" element={<Feed />} />
          <Route path="post/:id" element={<Post />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:id" element={<Conversation />} />
          <Route path="communities" element={<Communities />} />
          <Route path="communities/:id" element={<Community />} />
          <Route path="search" element={<Search />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="/feed" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
