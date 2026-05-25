import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'

function getMicroNutrients(name: string, calories: number, carbs: number, fat: number, protein: number) {
  const lowerName = name.toLowerCase()
  let sugar = 0
  let fiber = 0
  let sodium = 0

  if (lowerName.includes('rice') || lowerName.includes('nasi')) {
    sugar = Math.round(carbs * 0.02)
    fiber = Math.round(carbs * 0.05)
    sodium = 5
  } else if (lowerName.includes('chicken') || lowerName.includes('ayam')) {
    sugar = 0
    fiber = 0
    sodium = 80
  } else if (lowerName.includes('egg') || lowerName.includes('telur')) {
    sugar = Math.round(carbs * 0.1)
    fiber = 0
    sodium = 70
  } else if (lowerName.includes('banana') || lowerName.includes('pisang')) {
    sugar = Math.round(carbs * 0.45)
    fiber = Math.round(carbs * 0.11)
    sodium = 1
  } else if (lowerName.includes('apple') || lowerName.includes('apel')) {
    sugar = Math.round(carbs * 0.75)
    fiber = Math.round(carbs * 0.18)
    sodium = 1
  } else if (lowerName.includes('bread') || lowerName.includes('roti')) {
    sugar = Math.round(carbs * 0.15)
    fiber = Math.round(carbs * 0.15)
    sodium = 150
  } else if (lowerName.includes('milk') || lowerName.includes('susu')) {
    sugar = carbs
    fiber = 0
    sodium = 100
  } else if (lowerName.includes('chips') || lowerName.includes('chitato') || lowerName.includes('potato') || lowerName.includes('kentang')) {
    sugar = Math.round(carbs * 0.05)
    fiber = Math.round(carbs * 0.08)
    sodium = 170
  } else if (lowerName.includes('noodle') || lowerName.includes('indomie') || lowerName.includes('mie')) {
    sugar = Math.round(carbs * 0.08)
    fiber = Math.round(carbs * 0.04)
    sodium = 980
  } else if (lowerName.includes('tofu') || lowerName.includes('tahu') || lowerName.includes('tempe') || lowerName.includes('tempeh')) {
    sugar = Math.round(carbs * 0.05)
    fiber = Math.round(carbs * 0.25)
    sodium = 8
  } else {
    // Generic estimations
    sugar = Math.round(carbs * 0.25)
    fiber = Math.round(carbs * 0.1)
    sodium = Math.round(calories * 0.6)
  }

  return { sugar, fiber, sodium }
}

export const useHealthStore = defineStore('health', {
  state: () => ({
    // Goals & Stats
    dailyGoalCalories: 2400,
    consumedCalories: 0,
    dailyGoalWater: 8,
    consumedWater: 0,
    macros: {
      protein: { current: 0, goal: 150 },
      carbs: { current: 0, goal: 250 },
      fat: { current: 0, goal: 70 },
      sugar: { current: 0, goal: 50 },
      sodium: { current: 0, goal: 2000 },
      fiber: { current: 0, goal: 30 }
    },
    currentWeight: 70.0,
    goalWeight: 65.0,
    height: 170,
    recentMeals: [] as Array<{
      id: string
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
      sugar: number
      sodium: number
      fiber: number
      category: string
      time: string
    }>,
    weightHistory: [] as Array<{
      weight: number
      date: string
    }>
  }),
  getters: {
    calorieProgress: (state) => {
      if (state.dailyGoalCalories <= 0) return 0
      return Math.round(Math.min((state.consumedCalories / state.dailyGoalCalories) * 100, 100))
    },
    waterProgress: (state) => {
      if (state.dailyGoalWater <= 0) return 0
      return Math.round(Math.min((state.consumedWater / state.dailyGoalWater) * 100, 100))
    },
    bmi: (state) => {
      if (state.height <= 0) return '0.0'
      const heightInMeters = state.height / 100
      return (state.currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
    },

    /**
     * Weight target progress: percentage of how much weight has been lost/gained
     * towards the goal weight, based on the first weight log vs current.
     */
    weightProgressPercent: (state) => {
      const history = state.weightHistory
      if (!history || history.length === 0) return 0
      const firstEntry = history[0]
      if (!firstEntry) return 0
      const startWeight = firstEntry.weight
      const current = state.currentWeight
      const goal = state.goalWeight
      const totalDiff = startWeight - goal
      if (totalDiff === 0) return 100
      const achieved = startWeight - current
      // For weight gain goals (goal > start), flip the logic
      if (totalDiff < 0) {
        const totalGain = goal - startWeight
        const gainAchieved = current - startWeight
        return Math.max(0, Math.min(Math.round((gainAchieved / totalGain) * 100), 100))
      }
      return Math.max(0, Math.min(Math.round((achieved / totalDiff) * 100), 100))
    },

    /**
     * Real weekly weight difference based on logged weight history.
     * Returns kg change per week (negative = losing weight).
     */
    weeklyWeightDiff: (state) => {
      const history = state.weightHistory
      if (!history || history.length < 2) return 0
      const first = history[0]
      const last = history[history.length - 1]
      if (!first || !last) return 0
      // Parse dates from the display format or use index-based estimation
      const totalEntries = history.length
      const weightChange = last.weight - first.weight
      // Estimate weeks based on entry count (rough: assume ~2 entries/week min)
      const estimatedWeeks = Math.max(1, Math.ceil(totalEntries / 3))
      return Number((weightChange / estimatedWeeks).toFixed(1))
    },

    /**
     * Predicted weeks to reach goal weight based on current trend.
     * Returns number of weeks, or -1 if trend is going wrong direction,
     * or 0 if goal already reached.
     */
    predictedWeeksToGoal: (state) => {
      const history = state.weightHistory
      if (!history || history.length < 2) return -1
      const current = state.currentWeight
      const goal = state.goalWeight
      const remaining = Math.abs(current - goal)
      if (remaining < 0.1) return 0 // Goal reached

      const first = history[0]
      const last = history[history.length - 1]
      if (!first || !last) return -1
      const totalEntries = history.length
      const weightChange = last.weight - first.weight
      const estimatedWeeks = Math.max(1, Math.ceil(totalEntries / 3))
      const weeklyRate = weightChange / estimatedWeeks

      // Check direction: losing weight to goal below, gaining weight to goal above
      const needToLose = current > goal
      if (needToLose && weeklyRate >= 0) return -1 // Not losing
      if (!needToLose && weeklyRate <= 0) return -1 // Not gaining

      const weeksToGoal = Math.ceil(remaining / Math.abs(weeklyRate))
      return Math.min(weeksToGoal, 520) // Cap at 10 years
    }
  },
  actions: {
    async fetchTodayData() {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch User Profile
      const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

      if (profile) {
        this.dailyGoalCalories = profile.daily_goal_calories || 2400
        this.dailyGoalWater = profile.daily_goal_water || 8
        this.height = Number(profile.height) || 170
        this.goalWeight = Number(profile.goal_weight) || 65.0
      }

      // Start of today in local/UTC timezone
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isoToday = today.toISOString()

      // 2. Fetch Meals Logged Today
      const { data: meals } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', isoToday)
          .order('created_at', { ascending: false })

      if (meals) {
        let calories = 0
        let protein = 0
        let carbs = 0
        let fat = 0
        let sugar = 0
        let sodium = 0
        let fiber = 0

        this.recentMeals = meals.map(m => {
          calories += m.calories
          const pVal = m.protein || 0
          const cVal = m.carbs || 0
          const fVal = m.fat || 0
          
          protein += pVal
          carbs += cVal
          fat += fVal

          // Apply micro-nutrient estimation helper
          const micros = getMicroNutrients(m.name, m.calories, cVal, fVal, pVal)
          sugar += micros.sugar
          sodium += micros.sodium
          fiber += micros.fiber

          const timeString = new Date(m.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })

          return {
            id: m.id,
            name: m.name,
            calories: m.calories,
            protein: pVal,
            carbs: cVal,
            fat: fVal,
            sugar: micros.sugar,
            sodium: micros.sodium,
            fiber: micros.fiber,
            category: m.category,
            time: timeString
          }
        })

        this.consumedCalories = calories
        this.macros.protein.current = protein
        this.macros.carbs.current = carbs
        this.macros.fat.current = fat
        this.macros.sugar.current = sugar
        this.macros.sodium.current = sodium
        this.macros.fiber.current = fiber
      }

      // 3. Fetch Water Logs Today
      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', isoToday)

      if (waterLogs) {
        this.consumedWater = waterLogs.reduce((acc, curr) => acc + (curr.amount || 1), 0)
      }

      // 4. Fetch Weight Logs History
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (weightLogs && weightLogs.length > 0) {
        const lastLog = weightLogs[weightLogs.length - 1]
        if (lastLog) {
          this.currentWeight = Number(lastLog.weight)
        }
        
        // Map history to display in line charts
        this.weightHistory = weightLogs.map(w => {
          const dateString = new Date(w.created_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'numeric',
            day: 'numeric'
          })
          return {
            weight: Number(w.weight),
            date: dateString
          }
        })
      }
    },

    async addWater() {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Start of today in local/UTC timezone
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isoToday = today.toISOString()

      // Check if there is already a water log entry for today
      const { data: existingLogs, error: fetchError } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', isoToday)
        .order('created_at', { ascending: false })
        .limit(1)

      const existingLog = existingLogs && existingLogs.length > 0 ? existingLogs[0] : null

      if (existingLog) {
        // Increment amount of existing row
        const { error: updateError } = await supabase
          .from('water_logs')
          .update({ amount: (existingLog.amount || 0) + 1 })
          .eq('id', existingLog.id)

        if (!updateError) {
          this.consumedWater++
        }
      } else {
        // Create new log row for today
        const { error: insertError } = await supabase
          .from('water_logs')
          .insert({
            user_id: user.id,
            amount: 1
          })

        if (!insertError) {
          this.consumedWater++
        }
      }
    },

    async addMeal(meal: {
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
      category: string
    }) {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          name: meal.name,
          calories: Math.round(meal.calories),
          protein: Math.round(meal.protein),
          carbs: Math.round(meal.carbs),
          fat: Math.round(meal.fat),
          category: meal.category as any
        })

      if (error) {
        console.error('Error inserting meal:', error)
        throw error
      }

      await this.fetchTodayData()
    },

    async addWeight(weight: number) {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight: Number(weight)
        })

      if (!error) {
        await this.fetchTodayData()
      }
    },

    async deleteMeal(mealId: string) {
      const supabase = useSupabaseClient()
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)

      if (!error) {
        await this.fetchTodayData()
      }
    }
  }
})

