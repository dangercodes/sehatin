import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useSupabaseUser, useSupabaseClient } from '#imports'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const user = useSupabaseUser()
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/verified'
  ]

  const isPublicPage = publicRoutes.includes(to.path)

  // Redirect authenticated or guest users away from public pages
  if (isPublicPage) {
    if (user.value || authStore.isGuest) {
      return navigateTo('/dashboard')
    }
    return
  }

  // If not public page, and no user and not guest, redirect to login
  if (!user.value && !authStore.isGuest) {
    return navigateTo('/auth/login')
  }

  // Guests skip onboarding checks
  if (authStore.isGuest) {
    if (to.path === '/onboarding') {
      return navigateTo('/dashboard')
    }
    return
  }

  // Authenticated user: Check profile for onboarding completion
  const userId = await authStore.getUserId()
  if (!userId || userId === 'guest-user') {
    return navigateTo('/auth/login')
  }

  const supabase = useSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('height, goal_weight')
    .eq('id', userId)
    .single()

  const onboardingCompleted = profile && profile.height && profile.goal_weight

  // onboarding skip
  if (to.path === '/onboarding') {
    if (onboardingCompleted) {
      return navigateTo('/dashboard')
    }
    return
  }

  // missing onboarding metrics
  if (!onboardingCompleted) {
    return navigateTo('/onboarding')
  }
})
