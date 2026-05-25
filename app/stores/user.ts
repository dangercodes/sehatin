import { defineStore } from 'pinia'
import { useSupabaseUser, useSupabaseClient, navigateTo } from '#imports'

export const useUserStore = defineStore('user', {
  state: () => ({
    theme: 'light',
    profileName: '',
    profileAvatar: '',
  }),
  getters: {
    user: () => useSupabaseUser().value,
    isAuthenticated(): boolean {
      return !!this.user
    },
    name(): string {
      return this.profileName || this.user?.user_metadata?.name || 'User Sehatin'
    },
    email(): string {
      return this.user?.email || ''
    },
    avatar(): string {
      return this.profileAvatar || this.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${this.user?.id || 'default'}`
    }
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    async logout() {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      navigateTo('/')
    },
    async fetchProfile() {
      const supabase = useSupabaseClient()
      if (!this.user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single()

      if (data && !error) {
        this.profileName = data.name || ''
        this.profileAvatar = data.avatar_url || ''
      }
    }
  }
})

