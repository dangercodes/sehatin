import { defineStore } from 'pinia'
import { useSupabaseClient, useSupabaseUser, navigateTo } from '#imports'
import { ref, watch } from 'vue'
import { useUserStore } from './user'

export const useAuthStore = defineStore('auth', () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const registrationSuccess = ref(false)

  const guestCookie = useCookie('sh_is_guest', { maxAge: 60 * 60 * 24 * 30 }) // 30 days
  const isGuest = ref(guestCookie.value === 'true')

  // =========================
  // USER ID
  // =========================
  const getUserId = async (): Promise<string | undefined> => {
    if (isGuest.value) return 'guest-user'
    if (user.value?.id) return user.value.id

    const { data: userData } = await client.auth.getUser()

    if (userData?.user?.id) {
      return userData.user.id
    }

    return undefined
  }

  // =========================
  // REGISTER
  // =========================
  const register = async (
    email: string,
    password: string,
    name: string
  ) => {
    loading.value = true
    error.value = null
    registrationSuccess.value = false

    try {
      // Dynamically resolve redirect URL to support both local development and production domains.
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/verified`
        : 'http://localhost:3000/auth/verified'

      const { data, error: authError } =
        await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
            emailRedirectTo: redirectUrl,
          },
        })

      if (authError) {
        throw authError
      }
      
      isGuest.value = false
      guestCookie.value = null

      // If email confirmation is enabled, session will be null.
      // In that case, do not redirect; instead set registrationSuccess to true.
      if (!data.session) {
        registrationSuccess.value = true
        return
      }

      // Otherwise, the user is logged in automatically (email confirmation disabled)
      const userStore = useUserStore()
      await userStore.fetchProfile()
      await navigateTo('/onboarding')
    } catch (e: any) {
      error.value = e.message || 'Registration failed'
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LOGIN
  // =========================
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } =
        await client.auth.signInWithPassword({
          email,
          password,
        })

      if (authError) {
        throw authError
      }
      
      isGuest.value = false
      guestCookie.value = null

      const userStore = useUserStore()
      await userStore.fetchProfile()

      if (data.user) {
        // Fetch profile to see if user has completed onboarding
        const { data: profile } = await client
          .from('profiles')
          .select('height, goal_weight')
          .eq('id', data.user.id)
          .single()
        
        if (profile && (!profile.height || !profile.goal_weight)) {
          await navigateTo('/onboarding')
        } else {
          await navigateTo('/dashboard')
        }
      } else {
        await navigateTo('/dashboard')
      }
    } catch (e: any) {
      error.value = e.message || 'Login failed'
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LOGIN GUEST
  // =========================
  const loginGuest = async () => {
    loading.value = true
    error.value = null

    try {
      isGuest.value = true
      guestCookie.value = 'true'
      
      const userStore = useUserStore()
      userStore.profileName = 'Tamu Sehatin'
      userStore.profileAvatar = 'https://api.dicebear.com/7.x/notionists/svg?seed=guest'
      
      await navigateTo('/dashboard')
    } catch (e: any) {
      error.value = e.message || 'Gagal masuk sebagai tamu'
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    loading.value = true

    try {
      if (isGuest.value) {
        isGuest.value = false
        guestCookie.value = null
        await navigateTo('/auth/login')
        return
      }

      const userStore = useUserStore()
      userStore.profileName = ''
      userStore.profileAvatar = ''

      await client.auth.signOut()
      await navigateTo('/auth/login')
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    registrationSuccess,
    isGuest,
    getUserId,
    register,
    login,
    loginGuest,
    logout
  }
})
