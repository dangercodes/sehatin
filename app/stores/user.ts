import { defineStore } from 'pinia'
import { useSupabaseUser, useSupabaseClient, navigateTo } from '#imports'
import { useHealthStore } from './health'

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('sehatin_theme', this.theme)
      }
    },
    async logout() {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      navigateTo('/')
    },
    async fetchProfile() {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('sehatin_theme')
        if (savedTheme) {
          this.theme = savedTheme
        }
      }
      
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
    },
    async updateProfile(profileData: {
      name: string
      avatar_url: string
      height?: number
      goal_weight?: number
      daily_goal_calories?: number
      daily_goal_water?: number
    }) {
      const supabase = useSupabaseClient()
      if (!this.user) return { error: 'User not authenticated' }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          avatar_url: profileData.avatar_url,
          height: profileData.height,
          goal_weight: profileData.goal_weight,
          daily_goal_calories: profileData.daily_goal_calories,
          daily_goal_water: profileData.daily_goal_water
        })
        .eq('id', this.user.id)

      if (!error) {
        this.profileName = profileData.name
        this.profileAvatar = profileData.avatar_url
        
        // Sync locally with health store
        const healthStore = useHealthStore()
        if (profileData.height !== undefined) healthStore.height = Number(profileData.height)
        if (profileData.goal_weight !== undefined) healthStore.goalWeight = Number(profileData.goal_weight)
        if (profileData.daily_goal_calories !== undefined) healthStore.dailyGoalCalories = Number(profileData.daily_goal_calories)
        if (profileData.daily_goal_water !== undefined) healthStore.dailyGoalWater = Number(profileData.daily_goal_water)
        
        return { success: true }
      }
      return { error }
    }
  }
})

