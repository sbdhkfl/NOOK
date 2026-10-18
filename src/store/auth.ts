import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/supabase'

interface AuthState {
  user: UserProfile | null
  sessionUserId: string | null
  loading: boolean
  setUser: (user: UserProfile | null) => void
  setSessionUserId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  fetchProfile: (id: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionUserId: null,
      loading: true,
      setUser: (user) => set({ user }),
      setSessionUserId: (id) => set({ sessionUserId: id }),
      setLoading: (loading) => set({ loading }),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, sessionUserId: null, loading: false })
      },
      fetchProfile: async (id) => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()
        set({ user: data ?? null })
      },
    }),
    {
      name: 'nook-auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ sessionUserId: state.sessionUserId }),
    },
  ),
)
