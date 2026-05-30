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
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      await authStore.logout()
    },
    async fetchProfile() {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('sehatin_theme')
        if (savedTheme) {
          this.theme = savedTheme
        }
      }
      
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()

      if (authStore.isGuest) {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('sehatin_guest_profile')
          if (saved) {
            try {
              const data = JSON.parse(saved)
              this.profileName = data.name || 'Guest'
              this.profileAvatar = data.avatar_url || ''
            } catch (e) {}
          }
        }
        return
      }

      const supabase = useSupabaseClient()
      if (!this.user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single()

      if (data && !error) {
        this.profileName = data.name || 'User'
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
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      
      const healthStore = useHealthStore()

      if (authStore.isGuest) {
        this.profileName = profileData.name
        this.profileAvatar = profileData.avatar_url
        
        if (profileData.height !== undefined) healthStore.height = Number(profileData.height)
        if (profileData.goal_weight !== undefined) healthStore.goalWeight = Number(profileData.goal_weight)
        if (profileData.daily_goal_calories !== undefined) healthStore.dailyGoalCalories = Number(profileData.daily_goal_calories)
        if (profileData.daily_goal_water !== undefined) healthStore.dailyGoalWater = Number(profileData.daily_goal_water)
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('sehatin_guest_profile', JSON.stringify({
            name: this.profileName,
            avatar_url: this.profileAvatar,
            height: healthStore.height,
            goal_weight: healthStore.goalWeight,
            daily_goal_calories: healthStore.dailyGoalCalories,
            daily_goal_water: healthStore.dailyGoalWater
          }))
        }

        const { useGamificationStore } = await import('./gamification')
        useGamificationStore().syncTargets(healthStore)
        
        return { success: true }
      }

      const userId = await authStore.getUserId()
      if (!userId || userId === 'guest-user') return { error: 'User not authenticated' }

      const supabase = useSupabaseClient()

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
        .eq('id', userId)

      if (!error) {
        this.profileName = profileData.name
        this.profileAvatar = profileData.avatar_url
        
        // Sync locally with health store
        if (profileData.height !== undefined) healthStore.height = Number(profileData.height)
        if (profileData.goal_weight !== undefined) healthStore.goalWeight = Number(profileData.goal_weight)
        if (profileData.daily_goal_calories !== undefined) healthStore.dailyGoalCalories = Number(profileData.daily_goal_calories)
        if (profileData.daily_goal_water !== undefined) healthStore.dailyGoalWater = Number(profileData.daily_goal_water)
        
        const { useGamificationStore } = await import('./gamification')
        useGamificationStore().syncTargets(healthStore)

        return { success: true }
      }
      return { error }
    }
  }
})

