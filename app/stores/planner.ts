import { defineStore } from 'pinia'

export interface MealPlanDay {
  day: string
  breakfast: { name: string; calories: number; protein: number; carbs: number; fat: number; sugar: number }
  lunch: { name: string; calories: number; protein: number; carbs: number; fat: number; sugar: number }
  dinner: { name: string; calories: number; protein: number; carbs: number; fat: number; sugar: number }
  snack: { name: string; calories: number; protein: number; carbs: number; fat: number; sugar: number }
}

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    // Reminder Settings
    reminders: {
      breakfast: true,
      breakfastTime: '08:00',
      lunch: true,
      lunchTime: '12:30',
      dinner: true,
      dinnerTime: '19:00',
      water: true,
      waterIntervalHours: 2,
      weight: true,
      weightTime: '07:30'
    },
    // Generated Meal Plan
    generatedPlan: null as MealPlanDay[] | null,
    planMeta: null as {
      type: string // 'weekly' | 'daily'
      budget: string // 'economical' | 'normal'
      focus: string // 'balanced' | 'high_protein' | 'low_sugar'
      diet: string // 'general' | 'keto' | 'vegetarian' | 'diabetic'
    } | null,
    activeToast: null as { title: string; body: string; type: string } | null
  }),
  actions: {
    initializeStore() {
      if (typeof window !== 'undefined') {
        const savedReminders = localStorage.getItem('sehatin_reminders')
        if (savedReminders) {
          try {
            this.reminders = JSON.parse(savedReminders)
          } catch (e) {
            console.error('Failed to parse reminders', e)
          }
        }
        
        const savedPlan = localStorage.getItem('sehatin_meal_plan')
        if (savedPlan) {
          try {
            this.generatedPlan = JSON.parse(savedPlan)
          } catch (e) {
            console.error('Failed to parse meal plan', e)
          }
        }

        const savedMeta = localStorage.getItem('sehatin_plan_meta')
        if (savedMeta) {
          try {
            this.planMeta = JSON.parse(savedMeta)
          } catch (e) {
            console.error('Failed to parse plan meta', e)
          }
        }
      }
    },
    
    saveReminders(reminders: any) {
      this.reminders = { ...this.reminders, ...reminders }
      if (typeof window !== 'undefined') {
        localStorage.setItem('sehatin_reminders', JSON.stringify(this.reminders))
      }
    },

    saveMealPlan(plan: MealPlanDay[], meta: any) {
      this.generatedPlan = plan
      this.planMeta = meta
      if (typeof window !== 'undefined') {
        localStorage.setItem('sehatin_meal_plan', JSON.stringify(plan))
        localStorage.setItem('sehatin_plan_meta', JSON.stringify(meta))
      }
    },

    clearMealPlan() {
      this.generatedPlan = null
      this.planMeta = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sehatin_meal_plan')
        localStorage.removeItem('sehatin_plan_meta')
      }
    },

    showToast(title: string, body: string, type: 'info' | 'success' | 'warning' = 'success') {
      this.activeToast = { title, body, type }
      setTimeout(() => {
        if (this.activeToast?.title === title) {
          this.activeToast = null
        }
      }, 4000)
    },

    // HTML5 Native Web Notification Requester & Trigger
    async requestNotificationPermission(): Promise<boolean> {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return false
      }
      if (Notification.permission === 'granted') {
        return true
      }
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    },

    triggerNotification(title: string, body: string) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico'
          })
        } catch (e) {
          console.warn('Native notification failed', e)
        }
      }
      this.showToast(title, body, 'success')
    }
  }
})
