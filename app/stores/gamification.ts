import { defineStore } from 'pinia'
import { usePlannerStore } from './planner'

export interface Achievement {
  id: string
  titleId: string
  titleEn: string
  descriptionId: string
  descriptionEn: string
  target: number
  current: number
  unlocked: boolean
  icon: string
}

export interface Badge {
  id: string
  nameId: string
  nameEn: string
  descriptionId: string
  descriptionEn: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  gradient: string
}

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    streakCount: 0,
    lastActiveDate: '',
    achievements: [
      {
        id: 'no_soda',
        titleId: 'gamification.achievements.noSodaTitle',
        titleEn: '7 Days No Soda',
        descriptionId: 'gamification.achievements.noSodaDesc',
        descriptionEn: 'Avoid sugary sodas or soft drinks for 7 consecutive active days',
        target: 7,
        current: 0,
        unlocked: false,
        icon: 'Sparkles'
      },
      {
        id: 'tracking',
        titleId: 'gamification.achievements.trackingTitle',
        titleEn: '30 Days Tracking',
        descriptionId: 'gamification.achievements.trackingDesc',
        descriptionEn: 'Log your meals consistently to build a long-term habit',
        target: 30,
        current: 0,
        unlocked: false,
        icon: 'Activity'
      },
      {
        id: 'hydration',
        titleId: 'gamification.achievements.hydrationTitle',
        titleEn: 'Hydration Hero',
        descriptionId: 'gamification.achievements.hydrationDesc',
        descriptionEn: 'Drink 8 or more glasses of water in a single day',
        target: 8,
        current: 0,
        unlocked: false,
        icon: 'Droplets'
      },
      {
        id: 'protein',
        titleId: 'gamification.achievements.proteinTitle',
        titleEn: 'Protein Power',
        descriptionId: 'gamification.achievements.proteinDesc',
        descriptionEn: 'Hit your daily protein goals to support muscle maintenance',
        target: 5,
        current: 0,
        unlocked: false,
        icon: 'Scale'
      }
    ] as Achievement[],
    badges: [
      {
        id: 'soda_destroyer',
        nameId: 'gamification.badges.sodaDestroyerName',
        nameEn: 'Soda Destroyer',
        descriptionId: 'gamification.badges.sodaDestroyerDesc',
        descriptionEn: 'Successfully completed 7 days without consuming any soft drinks',
        icon: 'Award',
        unlocked: false,
        gradient: 'from-orange-500 to-amber-500'
      },
      {
        id: 'hydration_king',
        nameId: 'gamification.badges.hydrationKingName',
        nameEn: 'Hydration King',
        descriptionId: 'gamification.badges.hydrationKingDesc',
        descriptionEn: 'Achieved the ultimate water hydration target of 8 glasses',
        icon: 'Droplets',
        unlocked: false,
        gradient: 'from-blue-500 to-cyan-400'
      },
      {
        id: 'habit_builder',
        nameId: 'gamification.badges.habitBuilderName',
        nameEn: 'Habit Builder',
        descriptionId: 'gamification.badges.habitBuilderDesc',
        descriptionEn: 'Logged meals for 30 active days to secure tracking consistency',
        icon: 'CheckCircle2',
        unlocked: false,
        gradient: 'from-emerald-500 to-teal-400'
      },
      {
        id: 'streak_master',
        nameId: 'gamification.badges.streakMasterName',
        nameEn: 'Streak Master',
        descriptionId: 'gamification.badges.streakMasterDesc',
        descriptionEn: 'Maintained an active daily logging streak of 7 consecutive days',
        icon: 'Flame',
        unlocked: false,
        gradient: 'from-rose-500 to-orange-500'
      },
      {
        id: 'early_bird',
        nameId: 'gamification.badges.earlyBirdName',
        nameEn: 'Early Bird',
        descriptionId: 'gamification.badges.earlyBirdDesc',
        descriptionEn: 'Recorded your healthy breakfast meal before 8:00 AM',
        icon: 'Sparkles',
        unlocked: false,
        gradient: 'from-violet-500 to-purple-500'
      }
    ] as Badge[]
  }),

  actions: {
    initializeStore() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sehatin_gamification')
        if (saved) {
          try {
            const data = JSON.parse(saved)
            if (data.streakCount !== undefined) this.streakCount = data.streakCount
            if (data.lastActiveDate !== undefined) this.lastActiveDate = data.lastActiveDate
            
            // Merge achievements safely
            if (data.achievements) {
              data.achievements.forEach((savedAch: any) => {
                const existing = this.achievements.find(a => a.id === savedAch.id)
                if (existing) {
                  existing.current = savedAch.current
                  existing.unlocked = savedAch.unlocked
                }
              })
            }

            // Merge badges safely
            if (data.badges) {
              data.badges.forEach((savedBadge: any) => {
                const existing = this.badges.find(b => b.id === savedBadge.id)
                if (existing) {
                  existing.unlocked = savedBadge.unlocked
                  existing.unlockedAt = savedBadge.unlockedAt
                }
              })
            }
          } catch (e) {
            console.error('Failed to parse gamification local storage data', e)
          }
        }
      }
    },

    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'sehatin_gamification',
          JSON.stringify({
            streakCount: this.streakCount,
            lastActiveDate: this.lastActiveDate,
            achievements: this.achievements,
            badges: this.badges
          })
        )
      }
    },

    syncTargets(healthStore: any) {
      let updated = false
      const hydrationAch = this.achievements.find(a => a.id === 'hydration')
      if (hydrationAch && hydrationAch.target !== healthStore.dailyGoalWater) {
        hydrationAch.target = healthStore.dailyGoalWater
        updated = true
      }
      
      const proteinAch = this.achievements.find(a => a.id === 'protein')
      if (proteinAch && proteinAch.target !== healthStore.macros.protein.goal) {
        proteinAch.target = healthStore.macros.protein.goal
        updated = true
      }

      if (updated) {
        this.saveToLocalStorage()
      }
    },

    /**
     * Reactively checks current health statistics and triggers badge unlock if thresholds met.
     */
    checkProgress(healthStore: any) {
      const plannerStore = usePlannerStore()
      let updated = false
      let hasSoda = false

      // 1. Water / Hydration check
      const hydrationAch = this.achievements.find(a => a.id === 'hydration')
      if (hydrationAch) {
        const oldVal = hydrationAch.current
        hydrationAch.current = Math.min(healthStore.consumedWater, hydrationAch.target)
        
        if (hydrationAch.current >= hydrationAch.target && !hydrationAch.unlocked) {
          hydrationAch.unlocked = true
          this.unlockBadge('hydration_king', plannerStore)
          updated = true
        } else if (hydrationAch.current !== oldVal) {
          updated = true
        }
      }

      // 2. Protein Target check
      const proteinAch = this.achievements.find(a => a.id === 'protein')
      if (proteinAch) {
        const hasMetProteinToday = healthStore.macros.protein.current >= healthStore.macros.protein.goal
        // If they met protein today, let's make sure it's reflected
        // To make it interactive: if they hit it, we can increment their current active target days (up to 5)
        if (hasMetProteinToday && proteinAch.current < proteinAch.target) {
          const todayStr = new Date().toDateString()
          if (this.lastActiveDate !== todayStr) {
            proteinAch.current++
            updated = true
            if (proteinAch.current >= proteinAch.target && !proteinAch.unlocked) {
              proteinAch.unlocked = true
            }
          }
        }
      }

      // 3. No Soda Check
      const noSodaAch = this.achievements.find(a => a.id === 'no_soda')
      if (noSodaAch) {
        // Look through recent meals for sweet soda names
        hasSoda = healthStore.recentMeals.some((m: any) => {
          const name = m.name.toLowerCase()
          return name.includes('soda') || name.includes('cola') || name.includes('coke') || 
                 name.includes('sprite') || name.includes('fanta') || name.includes('pepsi')
        })

        if (hasSoda && noSodaAch.current > 0) {
          // If soda consumed, reset no soda achievement to 0!
          noSodaAch.current = 0
          noSodaAch.unlocked = false
          const existingBadge = this.badges.find(b => b.id === 'soda_destroyer')
          if (existingBadge) existingBadge.unlocked = false
          updated = true
          plannerStore.triggerNotification(
            'Soda Detected! 🥤',
            'Progress "7 Hari No Soda" Anda telah di-reset. Mari mulai kembali kebiasaan sehat Anda besok!'
          )
        }
      }

      // 4. Early Bird Breakfast check
      const earlyBirdBadge = this.badges.find(b => b.id === 'early_bird')
      if (earlyBirdBadge && !earlyBirdBadge.unlocked) {
        const breakfastMeal = healthStore.recentMeals.find((m: any) => m.category === 'Breakfast')
        if (breakfastMeal) {
          // Check if time is before 8:00 AM (08:00)
          // We can parse the format e.g. "07:30 AM" or similar
          const timeParts = breakfastMeal.time.match(/(\d+):(\d+)\s*(AM|PM)?/i)
          if (timeParts) {
            let hour = parseInt(timeParts[1])
            const minute = parseInt(timeParts[2])
            const ampm = timeParts[3]
            
            if (ampm && ampm.toUpperCase() === 'PM' && hour < 12) hour += 12
            if (ampm && ampm.toUpperCase() === 'AM' && hour === 12) hour = 0

            if (hour < 8) {
              this.unlockBadge('early_bird', plannerStore)
              updated = true
            }
          }
        }
      }

      // 5. Update Streak and Daily Activity
      const todayStr = new Date().toDateString()
      const yesterdayStr = new Date(Date.now() - 86400000).toDateString()

      if (healthStore.recentMeals.length > 0 || healthStore.consumedWater > 0 || healthStore.weightHistory.length > 0) {
        if (this.lastActiveDate !== todayStr) {
          if (this.lastActiveDate === yesterdayStr) {
            this.streakCount++
            // Increment tracking achievement days
            const trackingAch = this.achievements.find(a => a.id === 'tracking')
            if (trackingAch && trackingAch.current < trackingAch.target) {
              trackingAch.current++
              if (trackingAch.current >= trackingAch.target) {
                trackingAch.unlocked = true
                this.unlockBadge('habit_builder', plannerStore)
              }
            }
            // Increment No Soda achievement days
            if (noSodaAch && noSodaAch.current < noSodaAch.target && !hasSoda) {
              noSodaAch.current++
              if (noSodaAch.current >= noSodaAch.target) {
                noSodaAch.unlocked = true
                this.unlockBadge('soda_destroyer', plannerStore)
              }
            }
          } else {
            // Streak broken but active today
            this.streakCount = 1
          }
          this.lastActiveDate = todayStr
          updated = true

          // Check streak master badge
          if (this.streakCount >= 7) {
            this.unlockBadge('streak_master', plannerStore)
          }
        }
      }

      if (updated) {
        this.saveToLocalStorage()
      }
    },

    unlockBadge(badgeId: string, plannerStore: any) {
      const badge = this.badges.find(b => b.id === badgeId)
      if (badge && !badge.unlocked) {
        badge.unlocked = true
        badge.unlockedAt = new Date().toLocaleDateString()
        
        // Push sliding Toast alert
        const title = 'Lencana Terbuka! 🏆'
        const body = `Selamat! Anda berhasil membuka lencana "${badge.nameEn}" karena telah memenuhi target hidup sehat.`
        plannerStore.triggerNotification(title, body)
        this.saveToLocalStorage()
      }
    },

    /**
     * Simulates active days logged to let the user play with streaks, achievements, and unlock badges.
     */
    simulateActiveDay() {
      const plannerStore = usePlannerStore()
      this.streakCount++
      this.lastActiveDate = new Date().toDateString()

      // Progress active trackers
      this.achievements.forEach(ach => {
        if (ach.current < ach.target) {
          ach.current++
          if (ach.current >= ach.target && !ach.unlocked) {
            ach.unlocked = true
            // Find badge that fits this achievement
            let matchingBadgeId = ''
            if (ach.id === 'no_soda') matchingBadgeId = 'soda_destroyer'
            if (ach.id === 'tracking') matchingBadgeId = 'habit_builder'
            if (ach.id === 'hydration') matchingBadgeId = 'hydration_king'
            if (ach.id === 'protein') matchingBadgeId = 'streak_master' // simulate secondary

            if (matchingBadgeId) {
              this.unlockBadge(matchingBadgeId, plannerStore)
            }
          }
        }
      })

      // Simulate Early Bird badge unlock randomly if not yet unlocked
      const earlyBird = this.badges.find(b => b.id === 'early_bird')
      if (earlyBird && !earlyBird.unlocked && Math.random() > 0.5) {
        this.unlockBadge('early_bird', plannerStore)
      }

      // If streak hits 7, unlock streak master
      if (this.streakCount >= 7) {
        this.unlockBadge('streak_master', plannerStore)
      }

      this.saveToLocalStorage()
    },

    resetGamification() {
      this.streakCount = 0
      this.lastActiveDate = ''
      this.achievements.forEach(ach => {
        ach.current = 0
        ach.unlocked = false
      })
      this.badges.forEach(badge => {
        badge.unlocked = false
        badge.unlockedAt = undefined
      })
      this.saveToLocalStorage()
    }
  }
})
